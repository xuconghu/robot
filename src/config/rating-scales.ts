import type { AssessmentQuestion, RatingScale } from '@/types';

// 点数评分量表（1 = 左端，points = 右端），按此顺序呈现在0-100潜能题之后，题目顺序固定不打乱

// Godspeed 量表：语义差异评分，两端为一对反义形容词
export const GODSPEED_SCALE: RatingScale = {
  id: 'godspeed',
  category: 'Godspeed量表',
  title: '请评价您对该机器人的印象',
  hint: '每一行两端是一对意思相反的词，请选择更接近您印象的位置。',
  points: 5,
  items: [
    // 拟人化（Anthropomorphism）
    { id: 'godspeed_anthropomorphism_1', subCategory: '拟人化', left: '虚假的', right: '自然的' },
    { id: 'godspeed_anthropomorphism_2', subCategory: '拟人化', left: '似机械的', right: '似人类的' },
    { id: 'godspeed_anthropomorphism_3', subCategory: '拟人化', left: '无意识的', right: '有意识的' },
    { id: 'godspeed_anthropomorphism_4', subCategory: '拟人化', left: '人工的', right: '逼真的' },
    { id: 'godspeed_anthropomorphism_5', subCategory: '拟人化', left: '动作僵硬', right: '动作流畅' },

    // 生命感（Animacy）
    { id: 'godspeed_animacy_1', subCategory: '生命感', left: '死的', right: '活的' },
    { id: 'godspeed_animacy_2', subCategory: '生命感', left: '静止的', right: '活泼的' },
    { id: 'godspeed_animacy_3', subCategory: '生命感', left: '机械的', right: '有机的' },
    { id: 'godspeed_animacy_4', subCategory: '生命感', left: '人工的', right: '逼真的' },
    { id: 'godspeed_animacy_5', subCategory: '生命感', left: '迟钝的', right: '互动的' },
    { id: 'godspeed_animacy_6', subCategory: '生命感', left: '冷淡的', right: '反应迅速的' },
  ],
};

// 心智感知量表（Mind Perception）：Gray & Wegner (2012) 的4题简版
// 原量表两端为 not at all (1) / extremely (5)
export const MIND_PERCEPTION_SCALE: RatingScale = {
  id: 'mind_perception',
  category: '心智感知量表',
  title: '请指出您认为该机器人具备下述能力的程度',
  hint: '请选择最符合您看法的位置。',
  points: 5,
  items: [
    // 体验（Experience）
    { id: 'mind_experience_1', subCategory: '体验', text: '您认为它能够感受到疼痛吗？', left: '一点也不', right: '非常' },
    { id: 'mind_experience_2', subCategory: '体验', text: '您认为它能够感受到害怕吗？', left: '一点也不', right: '非常' },

    // 能动性（Agency）
    { id: 'mind_agency_1', subCategory: '能动性', text: '您认为它具备自主控制自己的能力吗？', left: '一点也不', right: '非常' },
    { id: 'mind_agency_2', subCategory: '能动性', text: '您认为它能进行有意图、有目的的思考吗？', left: '一点也不', right: '非常' },
  ],
};

// SPQ 量表：十点评分，无子分类
// 注意：第3题（独自进行实验）为反向题，分析时需反向计分（11 - 原始分）
export const SPQ_SCALE: RatingScale = {
  id: 'spq',
  category: 'SPQ量表',
  title: '请根据您的感受回答以下问题',
  hint: '请选择最符合您感受的位置。',
  points: 10,
  items: [
    { id: 'spq_1', subCategory: '', text: '您在多大程度上感觉自己在与这个机器人进行互动？', left: '一点也不', right: '非常' },
    { id: 'spq_2', subCategory: '', text: '您在多大程度上感觉这个机器人陪伴着您？', left: '一点也不', right: '非常' },
    { id: 'spq_3', subCategory: '', text: '您在多大程度上感觉自己只是独自在进行实验？', left: '一点也不', right: '非常' },
    { id: 'spq_4', subCategory: '', text: '您在多大程度上关注这个机器人？', left: '一点也不', right: '非常' },
    { id: 'spq_5', subCategory: '', text: '您在多大程度上感觉自己投入到了与这个机器人的互动中？', left: '一点也不', right: '非常' },
    { id: 'spq_6', subCategory: '', text: '您在多大程度上感觉这个机器人好像在回应您？', left: '一点也不', right: '非常' },
    { id: 'spq_7', subCategory: '', text: '您在多大程度上感觉您和这个机器人在互相交流？', left: '一点也不', right: '非常' },
  ],
};

export const RATING_SCALES: RatingScale[] = [GODSPEED_SCALE, MIND_PERCEPTION_SCALE, SPQ_SCALE];

// 所有量表的题目展开为一个数组（作答也按此顺序保存）
export const RATING_ITEM_COUNT = RATING_SCALES.reduce((sum, scale) => sum + scale.items.length, 0);

// 转换为普通题目格式，便于与其他题目一起保存和导出
export const ratingScalesToQuestions = (): AssessmentQuestion[] =>
  RATING_SCALES.flatMap(scale =>
    scale.items.map(item => ({
      id: item.id,
      category: scale.category,
      subCategory: item.subCategory,
      text: item.text ?? `${item.left} — ${item.right}`,
    }))
  );
