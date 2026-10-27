"use client";

import type { Dispatch, SetStateAction } from 'react';
import { useMemo, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import type { AssessmentQuestion, RatingScale } from '@/types';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { INITIAL_SLIDER_VALUE } from '@/config/questions';
import { ThumbsDown, ThumbsUp } from 'lucide-react';

interface AssessmentPanelProps {
  questions: AssessmentQuestion[];
  sliderValues: number[];
  onSliderValuesChange: Dispatch<SetStateAction<number[]>>;
  ratingScales: RatingScale[];
  ratingValues: (number | null)[]; // 所有五点量表题目按顺序展开后的作答
  onRatingValuesChange: Dispatch<SetStateAction<(number | null)[]>>;
  robotsAssessedCount: number;
  totalRobotsToAssess: number;
  isAssessmentActive: boolean;
  answeredQuestions: boolean[];
  setAnsweredQuestions: Dispatch<SetStateAction<boolean[]>>;
  currentAssessmentId: string;
}

export function AssessmentPanel({ 
  questions, 
  sliderValues,
  onSliderValuesChange,
  ratingScales,
  ratingValues,
  onRatingValuesChange,
  robotsAssessedCount,
  totalRobotsToAssess,
  isAssessmentActive,
  answeredQuestions,
  setAnsweredQuestions,
  currentAssessmentId
}: AssessmentPanelProps) {
  // 添加对内容区域的引用
  const contentRef = useRef<HTMLDivElement>(null);

  const handleSliderChange = (index: number, value: number[]) => {
    const newSliderValues = [...sliderValues];
    newSliderValues[index] = value[0];
    onSliderValuesChange(newSliderValues);
    
    // 标记为已回答
    const newAnsweredQuestions = [...answeredQuestions];
    newAnsweredQuestions[index] = true;
    setAnsweredQuestions(newAnsweredQuestions);
  };

  const handleRatingChange = (index: number, value: string) => {
    onRatingValuesChange(prev => {
      const next = [...prev];
      next[index] = Number(value);
      return next;
    });
  };

  const numAnsweredQuestions = useMemo(() => {
    const numSliders = answeredQuestions ? answeredQuestions.filter(answered => answered).length : 0;
    const numRatings = ratingValues.filter(value => value !== null).length;
    return numSliders + numRatings;
  }, [answeredQuestions, ratingValues]);

  const totalQuestions = questions.length + ratingValues.length;

  // 每个量表第一题在 ratingValues 中的位置
  const scaleOffsets = ratingScales.map((_, i) =>
    ratingScales.slice(0, i).reduce((sum, scale) => sum + scale.items.length, 0)
  );
    
  // 当robotsAssessedCount或currentAssessmentId变化时，滚动到顶部
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  }, [robotsAssessedCount, currentAssessmentId]);

  return (
    <Card className="shadow-lg rounded-lg overflow-hidden flex flex-col h-full">
      <CardHeader className="bg-slate-50 dark:bg-slate-900/50 py-3 flex-shrink-0">
        <CardTitle className="text-lg font-semibold text-primary">能力评估</CardTitle>
        <CardDescription className="text-sm text-muted-foreground">请根据以下标准，对机器人的各项潜能进行评分。</CardDescription>
        
        <div className="mt-2 px-3 py-1.5 bg-primary/5 rounded-lg flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center">
            <ThumbsDown className="h-3.5 w-3.5 mr-1 text-red-500" />
            <span>完全不同意 (0)</span>
          </div>
          <div className="flex items-center">
            <span>完全同意 (100)</span>
            <ThumbsUp className="h-3.5 w-3.5 ml-1 text-green-500" />
          </div>
        </div>
      </CardHeader>

      <CardContent ref={contentRef} className="flex-grow space-y-5 p-4 overflow-y-auto" style={{ maxHeight: "calc(100vh - 220px)" }}>
        {questions.map((question, index) => (
          <div key={question.id} className="space-y-2 first:pt-0">
            <Label htmlFor={question.id} className="text-base font-medium block text-foreground mb-1">
              {question.text}
            </Label>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center text-muted-foreground">
                  <ThumbsDown className="h-3.5 w-3.5 mr-1 text-red-500/80" />
                  <span>完全不同意</span>
                </div>
                <div className="flex items-center text-muted-foreground">
                  <span>完全同意</span>
                  <ThumbsUp className="h-3.5 w-3.5 ml-1 text-green-500/80" />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Slider
                  id={question.id}
                  min={0}
                  max={100}
                  step={1}
                  value={[sliderValues[index]]}
                  onValueChange={(value) => handleSliderChange(index, value)}
                  className="flex-grow h-5"
                  aria-label={`${question.text} slider`}
                />
                <span className="text-base font-semibold w-12 text-right text-accent tabular-nums">
                  {sliderValues[index]}%
                </span>
              </div>
            </div>
            {index < questions.length - 1 && <Separator className="mt-3" />}
          </div>
        ))}

        {ratingScales.map((scale, scaleIndex) => {
          const scalePoints = Array.from({ length: scale.points }, (_, i) => i + 1);
          return (
            <div key={scale.id} className="pt-4 space-y-4">
              <div className="px-3 py-2 bg-primary/5 rounded-lg">
                <h3 className="text-base font-semibold text-primary">{scale.title}</h3>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {scale.hint}（1 = 左侧，{scale.points} = 右侧）
                </p>
              </div>
              {scale.items.map((item, itemIndex) => {
                const index = scaleOffsets[scaleIndex] + itemIndex;
                return (
                  <div key={item.id} className="space-y-2">
                    {item.text && (
                      <Label className="text-base font-medium block text-foreground">{item.text}</Label>
                    )}
                    {scale.points <= 5 ? (
                      // 点数较少：两端标签放在选项左右两侧
                      <div className="grid grid-cols-[minmax(4.5rem,1fr)_auto_minmax(4.5rem,1fr)] items-center gap-2 sm:gap-3">
                        <span className="text-sm sm:text-base font-medium text-foreground text-right">{item.left}</span>
                        <RadioGroup
                          value={ratingValues[index] === null ? '' : String(ratingValues[index])}
                          onValueChange={(value) => handleRatingChange(index, value)}
                          className="flex gap-2 sm:gap-3"
                          aria-label={item.text ?? `${item.left} — ${item.right}`}
                        >
                          {scalePoints.map(point => (
                            <label key={point} className="flex flex-col items-center gap-1 cursor-pointer">
                              <RadioGroupItem value={String(point)} className="h-5 w-5" />
                              <span className="text-xs text-muted-foreground tabular-nums">{point}</span>
                            </label>
                          ))}
                        </RadioGroup>
                        <span className="text-sm sm:text-base font-medium text-foreground">{item.right}</span>
                      </div>
                    ) : (
                      // 点数较多：选项占满整行，两端标签放在下方，避免窄屏放不下
                      <div className="space-y-1">
                        <RadioGroup
                          value={ratingValues[index] === null ? '' : String(ratingValues[index])}
                          onValueChange={(value) => handleRatingChange(index, value)}
                          className="flex justify-between gap-1"
                          aria-label={item.text ?? `${item.left} — ${item.right}`}
                        >
                          {scalePoints.map(point => (
                            <label key={point} className="flex flex-col items-center gap-1 cursor-pointer">
                              <RadioGroupItem value={String(point)} className="h-5 w-5" />
                              <span className="text-xs text-muted-foreground tabular-nums">{point}</span>
                            </label>
                          ))}
                        </RadioGroup>
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>{item.left}</span>
                          <span>{item.right}</span>
                        </div>
                      </div>
                    )}
                    {itemIndex < scale.items.length - 1 && <Separator className="mt-3" />}
                  </div>
                );
              })}
            </div>
          );
        })}
      </CardContent>
      <Separator className="flex-shrink-0" />      <CardFooter className="flex flex-col items-start p-4 bg-slate-50 dark:bg-slate-900/50 flex-shrink-0">
        {isAssessmentActive && questions.length > 0 && sliderValues.length === questions.length && (
          <div className="w-full">
            <h3 className="text-lg font-semibold text-primary mb-2">当前答题进度</h3>
            <div className="text-3xl font-bold text-accent text-center py-1">
              {numAnsweredQuestions} / {totalQuestions}
            </div>
            <p className="text-sm text-muted-foreground text-center">
              已回答 {numAnsweredQuestions} 个问题，共 {totalQuestions} 个问题。
            </p>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
