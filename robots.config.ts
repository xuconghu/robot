export interface RobotImage {
  id: string;
  filename: string;
  name: string;
}

// 这里列出所有可用的机器人图片
// 从public/robot-images文件夹中读取的所有实际图片
export const ROBOT_IMAGES: RobotImage[] = [
  { id: 'robot001', filename: '/robot-images/101_O_H_O_S_P_T-Rimo.jpg', name: 'O_H_O_S_P_T-Rimo机器人' },
  { id: 'robot002', filename: '/robot-images/102_F_i_m_o机器人.jpg', name: 'F_i_m_o机器人' },
  
  // 这里是其他机器人数据...
  // 简化示例，实际会有更多数据
  { id: 'robot003', filename: '/robot-images/103_Atlas.jpg', name: 'Atlas机器人' },
  { id: 'robot004', filename: '/robot-images/104_Pepper.jpg', name: 'Pepper机器人' },
  { id: 'robot005', filename: '/robot-images/105_NAO.jpg', name: 'NAO机器人' }
];

// 每次评估需要的机器人数量
export const ROBOTS_PER_ASSESSMENT = 3;

// 随机选择指定数量的机器人
export function getRandomRobots(count: number = ROBOTS_PER_ASSESSMENT): RobotImage[] {
  // 复制数组防止修改原数组
  const shuffled = [...ROBOT_IMAGES];

  // Fisher-Yates 随机算法
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  // 返回前count个元素
  return shuffled.slice(0, count);
} 