export interface AssessmentQuestion {
  id: string;
  category: string;       // Main category, e.g., '一、感知潜能'
  subCategory: string;    // Sub-category, e.g., '感知接收能力'
  text: string;           // The specific question text, e.g., '它可以观察周围环境。'
}

export interface RatingItem {
  id: string;
  subCategory: string;    // 子类，如 '拟人化'
  text?: string;          // 题干（Godspeed 等语义差异题没有题干，只有两端的词）
  left: string;           // 1分端的标签
  right: string;          // 最高分端的标签
}

export interface RatingScale {
  id: string;
  category: string;       // 量表名称，导出时作为问题分类
  title: string;          // 显示给被试的指导语
  hint: string;           // 指导语下方的补充说明
  points: number;         // 评分点数，如 5
  items: RatingItem[];
}

export interface RobotFeature {
  id: string;
  label: string;
  value: string; // "是" | "否" | ""
}

export interface RobotImage {
  id: string;
  filename: string;
  name: string;
}

export interface StoredRobotAssessment {
  robotId: string;
  robotName: string;
  robotImageUrl: string; 
  timestamp: string;
  sliderValues: number[]; 
  shuffledQuestionsSnapshot: AssessmentQuestion[]; 
  overallScore: number;
  userName: string;
  userAge: number;
  userGender: string;
  userMajor: string;
  assessmentDuration: number; // 评估耗时（秒）
  features?: RobotFeature[]; // 添加特征评估数据
}

export interface AssessmentSession {
  selectedRobots: RobotImage[];
  currentRobotIndex: number;
  completedAssessments: StoredRobotAssessment[];
}
