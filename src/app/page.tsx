"use client";

import { useState, useEffect, useRef } from 'react';
import { RobotDisplay } from '@/components/image-upload-area';
import { AssessmentPanel } from '@/components/assessment-panel';
import { ASSESSMENT_QUESTIONS as ALL_QUESTIONS, INITIAL_SLIDER_VALUE } from '@/config/questions';
import { getRandomRobots } from '../config/robots';
import { RATING_SCALES, RATING_ITEM_COUNT, ratingScalesToQuestions } from '@/config/rating-scales';
import { SubmissionService } from '@/lib/api-service';
import type { AssessmentQuestion, StoredRobotAssessment, AssessmentSession } from '@/types';
import { Bot, Save, Download, ChevronRight, Upload, ExternalLink, User, Brain, Award, Book, AlertTriangle, Info, Braces, PencilRuler, Clipboard, Activity, BrainCircuit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { generateCsvContent, downloadCsv } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import MetaData from '@/components/meta-data';
import confetti from 'canvas-confetti';

// Helper function to shuffle an array (Fisher-Yates shuffle)
const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

// 生成本次提交的唯一ID，重试提交时保持不变，后端据此去重
const generateSubmissionId = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
};

const calculateOverallScore = (values: number[]): number => {
  if (!values || values.length === 0) return 0;
  const sum = values.reduce((acc, val) => acc + val, 0);
  return Math.round(sum / values.length);
};

export default function RobotVisionaryPage() {
  // 用户信息状态
  const [userInfo, setUserInfo] = useState({
    name: '',
    age: '',
    gender: '',
    major: ''
  });
  const [showUserForm, setShowUserForm] = useState(true);

  const [shuffledQuestions, setShuffledQuestions] = useState<AssessmentQuestion[]>([]);
  const [sliderValues, setSliderValues] = useState<number[]>([]);
  const [session, setSession] = useState<AssessmentSession>({
    selectedRobots: [],
    currentRobotIndex: 0,
    completedAssessments: []
  });
  const { toast } = useToast();

  // 提交到服务器的状态
  const submissionIdRef = useRef<string>('');
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  // 添加一个状态来跟踪用户是否调整了滑块
  const [answeredQuestions, setAnsweredQuestions] = useState<boolean[]>([]);

  // 五点量表（Godspeed、心智感知等）的作答，按 RATING_SCALES 中题目顺序排列（1-5，未作答为null）
  const [ratingValues, setRatingValues] = useState<(number | null)[]>(() => Array(RATING_ITEM_COUNT).fill(null));

  // 添加一个状态来跟踪当前评估的机器人id，用于触发评估面板滚动
  const [currentAssessmentId, setCurrentAssessmentId] = useState<string>('');
  
  // 添加评估开始时间状态，用于记录每个机器人的评估耗时
  // 这里使用state而不是ref是因为状态更新需要触发重渲染，
  // 且state提供的是不可变值，更适合记录特定时间点
  const [startTime, setStartTime] = useState<number | null>(null);
  
  // 添加当前评估时间计数器（仅用于后台记录，不在UI显示）
  const [elapsedTime, setElapsedTime] = useState<number>(0);

  // 使用useEffect设置计时器，每秒更新一次评估时间
  useEffect(() => {
    let timerId: NodeJS.Timeout | null = null;
    
    // 如果有开始时间，开始计时
    if (startTime !== null) {
      // 立即更新一次
      setElapsedTime(Math.round((Date.now() - startTime) / 1000));
      
      // 设置定时器每秒更新
      timerId = setInterval(() => {
        setElapsedTime(Math.round((Date.now() - startTime) / 1000));
      }, 1000);
    }
    
    // 清理函数
    return () => {
      if (timerId) {
        clearInterval(timerId);
      }
    };
  }, [startTime]);

  // 处理用户信息输入变化
  const handleUserInfoChange = (field: string, value: string) => {
    setUserInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // 提交用户信息，开始评估并记录开始时间
  const handleUserInfoSubmit = () => {
    // 简单验证
    if (!userInfo.name) {
      toast({
        title: "请填写姓名",
        description: "姓名是必填的",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    // 通过验证，隐藏表单并开始评估
    setShowUserForm(false);

    // 记录评估开始时间
    setStartTime(Date.now());
    
    toast({
      title: "信息已保存",
      description: `${userInfo.name}，欢迎参与机器人评估！`,
      duration: 3000,
    });
  };

  // 初始化: 随机选择机器人和问题
  useEffect(() => {
    setSession(prev => ({
      ...prev,
      selectedRobots: getRandomRobots(),
      currentRobotIndex: 0,
      completedAssessments: []
    }));

    // 随机排序问题
    setShuffledQuestions(shuffleArray(ALL_QUESTIONS));

    submissionIdRef.current = generateSubmissionId();
  }, []);

  // 将全部评估数据提交到服务器
  const submitAssessments = async (assessments: StoredRobotAssessment[]) => {
    setSubmitStatus('submitting');
    const success = await SubmissionService.submit(submissionIdRef.current, userInfo.name, assessments);
    setSubmitStatus(success ? 'success' : 'error');
  };

  // 当问题加载后初始化滑块值
  useEffect(() => {
    if (shuffledQuestions.length > 0) {
      setSliderValues(shuffledQuestions.map(() => INITIAL_SLIDER_VALUE));
    }
  }, [shuffledQuestions]);

  // 当问题加载后初始化回答状态
  useEffect(() => {
    if (shuffledQuestions.length > 0) {
      setAnsweredQuestions(shuffledQuestions.map(() => false));
    }
  }, [shuffledQuestions]);

  // 获取当前机器人
  const currentRobot = session.selectedRobots[session.currentRobotIndex] || null;

  // 检查所有问题是否都已回答（滑块值是否改变）
  const checkAllQuestionsAnswered = () => {
    if (answeredQuestions.length === 0) return false;
    
    // 检查是否有任何问题尚未回答（包括五点量表）
    const numUnanswered = answeredQuestions.filter(answered => !answered).length
      + ratingValues.filter(value => value === null).length;

    if (numUnanswered > 0) {
      toast({
        title: "评估未完成",
        description: `还有 ${numUnanswered} 道问题未评分，请完成所有问题后再继续。`,
        variant: "destructive",
        duration: 4000,
      });
      return false;
    }
    
    return true;
  };

  // 格式化时间显示 (将秒转为分:秒格式)
  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}分${remainingSeconds}秒`;
  };

  // 五彩纸屑特效函数
  const triggerConfetti = () => {
    // 完整版盛大庆祝效果
    const end = Date.now() + 2000;
    
    const colors = ['#4ade80', '#2dd4bf', '#60a5fa', '#c084fc', '#f472b6'];
    
    (function frame() {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 75,
        origin: { x: 0, y: 0.8 },
        colors: colors
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 75,
        origin: { x: 1, y: 0.8 },
        colors: colors
      });
      
      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    }());
    
    // 中间再来一波
    setTimeout(() => {
      confetti({
        particleCount: 100,
        spread: 130,
        origin: { x: 0.5, y: 0.3 },
        colors: colors
      });
    }, 500);
  };

  // 保存当前机器人评估并进入下一个
  const handleSaveAndNext = () => {
    if (!currentRobot || shuffledQuestions.length === 0 || sliderValues.length !== shuffledQuestions.length) {
      toast({
        title: "错误",
        description: "评估数据不完整，无法保存。",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    // 检查是否所有问题都已回答
    if (!checkAllQuestionsAnswered()) {
      return;
    }

    // 计算评估耗时（秒）
    const assessmentDuration = startTime ? Math.round((Date.now() - startTime) / 1000) : 0;

    // 综合评分只统计0-100的潜能题，不含五点量表
    const overallScore = calculateOverallScore(sliderValues);
    const currentAssessment: StoredRobotAssessment = {
      robotId: currentRobot.id,
      robotName: currentRobot.name,
      robotImageUrl: currentRobot.filename,
      timestamp: new Date().toISOString(),
      // 五点量表作为额外题目接在潜能题之后，评分为1-5
      sliderValues: [...sliderValues, ...ratingValues.map(value => value ?? 0)],
      shuffledQuestionsSnapshot: [...shuffledQuestions, ...ratingScalesToQuestions()],
      overallScore,
      // 添加用户信息到评估数据
      userName: userInfo.name,
      userAge: Number(userInfo.age),
      userGender: userInfo.gender,
      userMajor: userInfo.major,
      // 添加评估耗时
      assessmentDuration
    };

    const completedAssessments = [...session.completedAssessments, currentAssessment];

    // 保存当前评估并更新会话状态
    setSession(prev => ({
      ...prev,
      completedAssessments,
      currentRobotIndex: prev.currentRobotIndex + 1
    }));

    // 最后一个机器人评估完成后，提交全部数据到服务器
    if (completedAssessments.length >= session.selectedRobots.length) {
      submitAssessments(completedAssessments);
    }

    // 重置滑块值为初始值
    setSliderValues(shuffledQuestions.map(() => INITIAL_SLIDER_VALUE));

    // 重置五点量表作答
    setRatingValues(Array(RATING_ITEM_COUNT).fill(null));

    // 重置回答状态
    setAnsweredQuestions(shuffledQuestions.map(() => false));

    // 滚动到页面顶部
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
    
    // 更新currentAssessmentId以触发评估面板滚动到顶部
    setCurrentAssessmentId(Date.now().toString());
    
    // 为下一个机器人重置评估开始时间
    setStartTime(Date.now());

    toast({
      title: "已保存",
      description: `已保存对${currentRobot.name}的评估，总分: ${overallScore}%`,
      duration: 3000,
    });
  };

  // 完成所有评估并导出
  const handleFinishAndExport = () => {
    // 检查是否有完成的评估
    if (session.completedAssessments.length === 0) {
      toast({
        title: "没有数据",
        description: "没有可导出的数据。请至少评估一个机器人。",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    // 导出CSV
    const csvContent = generateCsvContent(session.completedAssessments);
    if (!csvContent) {
      toast({
        title: "导出失败",
        description: "生成CSV内容时发生错误。",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }
    
    const filename = `robot_assessments_${userInfo.name}_${new Date().toISOString().split('T')[0]}.csv`;
    downloadCsv(csvContent, filename);

    toast({
      title: "导出成功",
      description: `已导出${session.completedAssessments.length}个机器人的评估数据。`,
      duration: 5000,
    });
  };

  // 所有机器人评估完成
  const isAllCompleted = session.currentRobotIndex >= session.selectedRobots.length;
  
  // 当完成所有评估时触发五彩纸屑
  useEffect(() => {
    if (isAllCompleted && session.completedAssessments.length > 0) {
      // 添加一点延迟使界面先渲染出来
      setTimeout(() => {
        triggerConfetti();
      }, 500);
    }
  }, [isAllCompleted, session.completedAssessments.length]);
  
  // 计算进度
  const completionPercentage = session.selectedRobots.length > 0
    ? Math.round((session.completedAssessments.length / session.selectedRobots.length) * 100)
    : 0;

  return (
    <>
      <MetaData />
      
   

      <div className="container mx-auto px-4 flex flex-col items-center justify-center py-4 min-h-[calc(100vh-150px)]">
        {showUserForm ? (
          // 用户信息表单与研究说明
          <div className="grid md:grid-cols-12 gap-5 max-w-[1800px] w-full h-full flex items-stretch my-8">
            <Card className="md:col-span-6 shadow-xl rounded-lg h-full flex flex-col">
              <CardHeader className="bg-gradient-to-r from-primary/10 to-card-foreground/5 p-2">
                <div className="flex items-center">
                  <Clipboard className="h-6 w-6 text-primary mr-2" />
                  <div>
                    <CardTitle className="text-xl font-semibold text-primary">
                      第一步：问卷填写
                    </CardTitle>
                    <CardDescription className="text-sm">
                      请先完成问卷后再进行机器人评估
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-6 flex-grow">
                <div className="rounded-lg bg-primary/5 p-4 mb-4">
                  <div className="flex items-start">
                    <ExternalLink className="h-6 w-6 text-primary mt-0.5 mr-3 flex-shrink-0" />
                    <p className="text-base">
                      请先前往 <a href="https://f.wps.cn/g/X5mjgNpg/" target="_blank" rel="noopener noreferrer" className="text-primary font-medium underline underline-offset-2">https://f.wps.cn/g/X5mjgNpg/</a> 填写问卷。
                      <span className="block mt-2 text-muted-foreground">请于问卷中自查是否已参与过。</span>
                    </p>
                  </div>
                </div>
                
                <Separator className="my-4" />
                
                <div className="flex items-center">
                  <User className="h-8 w-8 text-primary mr-3" />
                  <div>
                    <CardTitle className="text-lg font-semibold text-primary">
                      第二步：输入姓名
                    </CardTitle>
                    <CardDescription className="text-base">
                      完成问卷后输入姓名参与本次研究
                    </CardDescription>
                  </div>
                </div>
                
                <div className="space-y-3 mt-4">
                  <Label htmlFor="username" className="text-base">姓名</Label>
                  <Input 
                    id="username" 
                    placeholder="请输入您的姓名" 
                    value={userInfo.name}
                    onChange={(e) => handleUserInfoChange('name', e.target.value)}
                    className="py-6 text-base"
                  />
                </div>
                
                <Button 
                  onClick={handleUserInfoSubmit} 
                  className="w-full mt-5 py-6 text-lg"
                >
                  开始评估
                </Button>
              </CardContent>
            </Card>

            <Card className="md:col-span-6 shadow-xl rounded-lg h-full flex flex-col">
              <CardHeader className="bg-gradient-to-r from-primary/10 to-card-foreground/5 p-2">
                <div className="flex items-center">
                  <Info className="h-6 w-6 text-primary mr-2" />
                  <div>
                    <CardTitle className="text-xl font-semibold text-primary">
                      关于本研究
                    </CardTitle>
                    <CardDescription className="text-sm">
                      机器人评估研究项目的背景与目的
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 flex-grow">
                <div className="space-y-6">
                    <div className="space-y-6">
                        <div className="flex items-start space-x-3">
                          <Activity className="h-8 w-8 text-primary/80 mt-1 flex-shrink-0" />
                          <div>
                            <h3 className="text-lg font-semibold text-foreground">评估流程</h3>
                            <p className="text-base text-muted-foreground mt-1">
                              您将评估{session.selectedRobots.length}个随机选择的机器人形象，每个机器人需要回答一系列关于其各方面潜能的问题。请确保每个问题都经过认真思考后再作答。
                            </p>
                          </div>
                        </div>

                        <Separator className="my-4" />
                        
                        <div className="flex items-start space-x-3">
                          <Brain className="h-8 w-8 text-primary/80 mt-1 flex-shrink-0" />
                          <div>
                            <h3 className="text-lg font-semibold text-foreground">数据用途</h3>
                            <p className="text-base text-muted-foreground mt-1">
                              您的评估数据将用于科学研究，帮助我们分析人类对机器人能力的认知模式，并可能为未来机器人设计提供洞见。所有数据将以匿名方式处理。
                            </p>
                          </div>
                        </div>

                        <div className="rounded-lg bg-primary/5 p-4 mt-6">
                          <div className="flex items-start">
                            <AlertTriangle className="h-5 w-5 text-primary mt-0.5 mr-2 flex-shrink-0" />
                            <p className="text-base text-muted-foreground">
                              <strong>重要提示：</strong> 评估过程中请确保对每个问题都进行评分，未完成所有问题将无法进入下一个机器人的评估。完成所有机器人评估后，数据会自动提交，请在看到"数据已成功提交"后再关闭页面。
                            </p>
                          </div>
                        </div>
                    </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : !isAllCompleted ? (
          // 评估界面
          <div className="grid md:grid-cols-2 gap-6 lg:gap-8 max-w-[1800px] w-full items-center justify-center">
            {session.selectedRobots.length > 0 && (
              <div className="flex flex-col gap-6">
                <RobotDisplay 
                  robot={currentRobot} 
                  currentIndex={session.currentRobotIndex}
                  totalRobots={session.selectedRobots.length}
                />
                
                {/* 操作控制面板 */}
                {!showUserForm && !isAllCompleted && (
                  <Card className="shadow-lg rounded-lg">
                    <CardHeader className="bg-gradient-to-r from-primary/10 to-card-foreground/5 py-3">
                      <div className="flex items-center">
                        <PencilRuler className="h-6 w-6 text-primary mr-2" />
                        <CardTitle className="text-lg font-semibold text-primary">操作控制</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>完成进度</span>
                            <span className="font-medium">{completionPercentage}%</span>
                          </div>
                          <Progress value={completionPercentage} className="h-2" />
                        </div>
                        
                        <Button 
                          onClick={handleSaveAndNext} 
                          disabled={!currentRobot || shuffledQuestions.length === 0} 
                          className="w-full py-4 text-base"
                        >
                          保存并评估下一个机器人 <ChevronRight className="ml-2 h-5 w-5" />
                        </Button>
                        
                        <div className="rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 p-3 mt-1">
                          <div className="flex items-start">
                            <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-500 mt-0.5 mr-2 flex-shrink-0" />
                            <p className="text-xs text-amber-800 dark:text-amber-400">
                              请确保完成对所有问题的评分，否则无法进入下一个机器人的评估。
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
            
            {shuffledQuestions.length > 0 && sliderValues.length === shuffledQuestions.length ? (
              <AssessmentPanel
                questions={shuffledQuestions}
                sliderValues={sliderValues}
                onSliderValuesChange={setSliderValues}
                ratingScales={RATING_SCALES}
                ratingValues={ratingValues}
                onRatingValuesChange={setRatingValues}
                robotsAssessedCount={session.completedAssessments.length}
                totalRobotsToAssess={session.selectedRobots.length}
                isAssessmentActive={!!currentRobot}
                answeredQuestions={answeredQuestions}
                setAnsweredQuestions={setAnsweredQuestions}
                currentAssessmentId={currentAssessmentId}
              />
            ) : (
              <div className="flex items-center justify-center h-full bg-card rounded-lg shadow-lg p-6">
                <p className="text-muted-foreground">正在加载评估问题...</p>
              </div>
            )}
          </div>
        ) : (
          // 评估完成界面
          <Card className="shadow-lg rounded-lg overflow-hidden mb-6 max-w-[900px]">
            <CardHeader className="bg-gradient-to-r from-primary/10 to-card-foreground/5">
              <div className="flex items-center">
                <Award className="h-8 w-8 text-primary mr-3" />
                <div>
                  <CardTitle className="text-xl font-semibold text-primary">评估完成</CardTitle>
                  <CardDescription>
                    您已完成所有{session.selectedRobots.length}个机器人的评估
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-5">
              <div className="text-center py-6">
                <Bot className="mx-auto h-16 w-16 text-accent mb-4" />
                <h2 className="text-2xl font-bold mb-2">感谢您的参与！</h2>
                <p className="text-muted-foreground">
                  您的评估对我们的研究非常有价值。
                </p>
              </div>

              {submitStatus === 'success' ? (
                <div className="rounded-lg border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/30 p-4 text-center">
                  <p className="text-base font-medium text-green-800 dark:text-green-400">
                    数据已成功提交，您现在可以关闭本页面。
                  </p>
                </div>
              ) : submitStatus === 'error' ? (
                <div className="rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 p-4 space-y-4">
                  <div className="flex items-start">
                    <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-500 mt-0.5 mr-2 flex-shrink-0" />
                    <p className="text-sm text-amber-800 dark:text-amber-400">
                      数据提交失败，可能是网络问题。请<strong>不要关闭本页面</strong>，点击下方按钮重新提交。如果多次失败，请导出CSV文件并发送给研究人员。
                    </p>
                  </div>
                  <Button
                    onClick={() => submitAssessments(session.completedAssessments)}
                    className="w-full py-5 text-base"
                  >
                    <Upload className="mr-2 h-5 w-5" /> 重新提交
                  </Button>
                  <Button
                    onClick={handleFinishAndExport}
                    variant="outline"
                    className="w-full py-5 text-base"
                  >
                    <Download className="mr-2 h-5 w-5" /> 导出评估数据 (CSV)
                  </Button>
                </div>
              ) : (
                <div className="rounded-lg border bg-card p-4 text-center">
                  <p className="text-base text-muted-foreground">
                    正在提交数据，请勿关闭页面……
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
      

    </>
  );
}
