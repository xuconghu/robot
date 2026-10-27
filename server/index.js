// 机器人评估数据收集后端
// 依赖：仅 Node.js 内置模块（Node 18+），无需 npm install
//
// 环境变量：
//   PORT            监听端口，默认 8790
//   HOST            监听地址，默认 127.0.0.1（由 nginx 反向代理对外提供 HTTPS）
//   DATA_DIR        数据目录，默认 ./data
//   EXPORT_TOKEN    导出数据的密码（必填）
//   ALLOWED_ORIGINS 允许跨域访问的前端地址，逗号分隔
//
// 接口：
//   GET  /api/health                  健康检查
//   POST /api/submissions             提交一名被试的全部评估数据
//   GET  /api/export?token=XXX        下载全部数据（CSV，一题一行）
//   GET  /api/export?token=XXX&format=json   下载全部原始数据（JSON）

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = parseInt(process.env.PORT || '8790', 10);
const HOST = process.env.HOST || '127.0.0.1';
const DATA_DIR = path.resolve(process.env.DATA_DIR || path.join(__dirname, 'data'));
const DATA_FILE = path.join(DATA_DIR, 'submissions.jsonl');
const EXPORT_TOKEN = process.env.EXPORT_TOKEN || '';
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || 'https://zhishiweilai.com,https://www.zhishiweilai.com,http://localhost:9003')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);
const MAX_BODY_BYTES = 1024 * 1024;

if (!EXPORT_TOKEN) {
  console.error('缺少环境变量 EXPORT_TOKEN，拒绝启动');
  process.exit(1);
}

fs.mkdirSync(DATA_DIR, { recursive: true });

// 已保存的提交ID，用于防止重复提交（被试网络重试时）
const savedIds = new Set();
if (fs.existsSync(DATA_FILE)) {
  for (const line of fs.readFileSync(DATA_FILE, 'utf8').split('\n')) {
    if (!line.trim()) continue;
    try {
      savedIds.add(JSON.parse(line).submissionId);
    } catch {
      console.warn('数据文件中有无法解析的行，已跳过');
    }
  }
}

function readAllSubmissions() {
  if (!fs.existsSync(DATA_FILE)) return [];
  return fs.readFileSync(DATA_FILE, 'utf8')
    .split('\n')
    .filter(line => line.trim())
    .flatMap(line => {
      try {
        return [JSON.parse(line)];
      } catch {
        return [];
      }
    });
}

// ---------- 校验 ----------

const isStr = (v, max = 500) => typeof v === 'string' && v.length <= max;
const isNum = v => typeof v === 'number' && Number.isFinite(v);

function validateSubmission(body) {
  if (!body || typeof body !== 'object') return '请求体不是有效的JSON对象';
  if (!isStr(body.submissionId, 100) || !body.submissionId) return '缺少 submissionId';
  if (!isStr(body.userName, 100) || !body.userName.trim()) return '缺少被试姓名';
  if (!Array.isArray(body.assessments) || body.assessments.length === 0 || body.assessments.length > 20) {
    return 'assessments 必须是非空数组';
  }
  for (const a of body.assessments) {
    if (!a || typeof a !== 'object') return 'assessments 中有无效项';
    if (!isStr(a.robotId, 50) || !isStr(a.robotName) || !isStr(a.robotImageUrl)) return '机器人信息不完整';
    if (!Array.isArray(a.questions) || !Array.isArray(a.sliderValues)) return '缺少题目或评分';
    if (a.questions.length !== a.sliderValues.length || a.questions.length > 200) return '题目与评分数量不一致';
    if (!a.sliderValues.every(isNum)) return '评分必须是数字';
    for (const q of a.questions) {
      if (!q || !isStr(q.id, 100) || !isStr(q.category) || !isStr(q.subCategory) || !isStr(q.text, 2000)) {
        return '题目信息不完整';
      }
    }
  }
  return null;
}

// 只保留需要的字段，丢弃客户端传来的其他内容
function normalizeSubmission(body, req) {
  return {
    submissionId: body.submissionId,
    receivedAt: new Date().toISOString(),
    userName: body.userName.trim(),
    userAgent: String(req.headers['user-agent'] || '').slice(0, 500),
    assessments: body.assessments.map((a, i) => ({
      presentationOrder: i + 1,
      robotId: a.robotId,
      robotName: a.robotName,
      robotImageUrl: a.robotImageUrl,
      timestamp: isStr(a.timestamp, 50) ? a.timestamp : '',
      assessmentDuration: isNum(a.assessmentDuration) ? a.assessmentDuration : null,
      overallScore: isNum(a.overallScore) ? a.overallScore : null,
      questions: a.questions.map(q => ({ id: q.id, category: q.category, subCategory: q.subCategory, text: q.text })),
      sliderValues: a.sliderValues,
    })),
  };
}

// ---------- CSV 导出 ----------

const csvCell = v => {
  const s = v === null || v === undefined ? '' : String(v);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

function toCsv(submissions) {
  const header = [
    '提交ID (SubmissionID)',
    '提交时间 (ReceivedAt)',
    '用户姓名 (UserName)',
    '呈现顺序 (PresentationOrder)',
    '机器人ID (RobotID)',
    '机器人名称 (RobotName)',
    '机器人图片URL (RobotImageURL)',
    '评估时间戳 (Timestamp)',
    '评估耗时(秒) (AssessmentDuration)',
    '机器人综合评分 (OverallRobotScore)',
    '题目序号 (QuestionOrder)',
    '问题ID (QuestionID)',
    '问题分类 (Category)',
    '问题子分类 (SubCategory)',
    '问题文本 (QuestionText)',
    '单项评分 (IndividualScore)',
  ];
  const rows = submissions.flatMap(s =>
    s.assessments.flatMap(a =>
      a.questions.map((q, i) => [
        s.submissionId, s.receivedAt, s.userName,
        a.presentationOrder, a.robotId, a.robotName, a.robotImageUrl,
        a.timestamp, a.assessmentDuration, a.overallScore,
        i + 1, q.id, q.category, q.subCategory, q.text, a.sliderValues[i],
      ].map(csvCell).join(','))
    )
  );
  // 开头加 BOM，Excel 打开中文不乱码
  return '﻿' + [header.map(csvCell).join(','), ...rows].join('\r\n');
}

// ---------- HTTP ----------

function send(res, status, body, headers = {}) {
  const isText = typeof body === 'string';
  res.writeHead(status, {
    'Content-Type': isText ? 'text/plain; charset=utf-8' : 'application/json; charset=utf-8',
    ...headers,
  });
  res.end(isText ? body : JSON.stringify(body));
}

function setCors(req, res) {
  const origin = req.headers.origin;
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  }
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on('data', chunk => {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        reject(new Error('请求体过大'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

async function handleSubmit(req, res) {
  let body;
  try {
    body = JSON.parse(await readBody(req));
  } catch (err) {
    return send(res, 400, { success: false, error: err.message === '请求体过大' ? err.message : '请求体不是有效的JSON' });
  }

  const error = validateSubmission(body);
  if (error) return send(res, 400, { success: false, error });

  if (savedIds.has(body.submissionId)) {
    return send(res, 200, { success: true, submissionId: body.submissionId, duplicate: true });
  }

  const record = normalizeSubmission(body, req);
  fs.appendFileSync(DATA_FILE, JSON.stringify(record) + '\n', 'utf8');
  savedIds.add(record.submissionId);
  console.log(`[${record.receivedAt}] 收到提交 ${record.submissionId}（${record.assessments.length}个机器人）`);
  return send(res, 200, { success: true, submissionId: record.submissionId });
}

function handleExport(url, res) {
  if (url.searchParams.get('token') !== EXPORT_TOKEN) {
    return send(res, 403, { success: false, error: '密码错误' });
  }
  const submissions = readAllSubmissions();
  const date = new Date().toISOString().slice(0, 10);
  if (url.searchParams.get('format') === 'json') {
    return send(res, 200, submissions, {
      'Content-Disposition': `attachment; filename="robot_submissions_${date}.json"`,
    });
  }
  res.writeHead(200, {
    'Content-Type': 'text/csv; charset=utf-8',
    'Content-Disposition': `attachment; filename="robot_assessments_${date}.csv"`,
  });
  res.end(toCsv(submissions));
}

const server = http.createServer(async (req, res) => {
  setCors(req, res);
  const url = new URL(req.url, 'http://localhost');

  try {
    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      return res.end();
    }
    if (url.pathname === '/api/health' && req.method === 'GET') {
      return send(res, 200, { success: true, submissions: savedIds.size });
    }
    if (url.pathname === '/api/submissions' && req.method === 'POST') {
      return await handleSubmit(req, res);
    }
    if (url.pathname === '/api/export' && req.method === 'GET') {
      return handleExport(url, res);
    }
    return send(res, 404, { success: false, error: '未找到' });
  } catch (err) {
    console.error('处理请求出错:', err);
    return send(res, 500, { success: false, error: '服务器内部错误' });
  }
});

server.listen(PORT, HOST, () => {
  console.log(`机器人评估后端已启动：http://${HOST}:${PORT}，数据文件：${DATA_FILE}`);
});
