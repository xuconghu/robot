import type { StoredRobotAssessment } from '@/types';

// 后端API服务地址（构建时通过环境变量 NEXT_PUBLIC_API_URL 指定）
// 本地测试默认连 http://localhost:8790（可通过 SSH 隧道转发到服务器）
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8790';

// 评估数据提交服务
export const SubmissionService = {
  // 提交一名被试的全部评估数据，成功返回 true
  // submissionId 由前端生成，重试时保持不变，后端据此去重
  async submit(submissionId: string, userName: string, assessments: StoredRobotAssessment[]): Promise<boolean> {
    try {
      const response = await fetch(`${API_URL}/api/submissions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          submissionId,
          userName,
          assessments: assessments.map(a => ({
            robotId: a.robotId,
            robotName: a.robotName,
            robotImageUrl: a.robotImageUrl,
            timestamp: a.timestamp,
            assessmentDuration: a.assessmentDuration,
            overallScore: a.overallScore,
            questions: a.shuffledQuestionsSnapshot,
            sliderValues: a.sliderValues,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error(`提交评估数据失败: ${response.status}`);
      }

      const data = await response.json();
      return data.success || false;
    } catch (error) {
      console.error('提交评估数据失败:', error);
      return false;
    }
  }
};
