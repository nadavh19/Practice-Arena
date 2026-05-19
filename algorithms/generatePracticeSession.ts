import { computeDifficulty } from "@/algorithms/computeDifficulty";
import { selectTasks, type FeedbackSummary, type TaskForSelection } from "@/algorithms/selectTasks";
import { splitTimeBlocks } from "@/algorithms/splitTimeBlocks";

type GeneratePracticeSessionParams = {
  userLevel: string;
  availableTime: number;
  mood?: string | null;
  sessionGoal?: string | null;
  profileGoals?: string | null;
  feedbackSummary?: FeedbackSummary;
  tasks: TaskForSelection[];
};

export function generatePracticeSession(params: GeneratePracticeSessionParams) {
  const difficulty = computeDifficulty(params.userLevel);
  const timeBlocks = splitTimeBlocks(params.availableTime, 5);
  const totalBlockMinutes = timeBlocks.reduce((sum, block) => sum + block, 0);

  const selectedTasks = selectTasks(params.tasks, difficulty, totalBlockMinutes, {
    mood: params.mood,
    sessionGoal: params.sessionGoal,
    profileGoals: params.profileGoals,
    feedbackSummary: params.feedbackSummary,
  });
  const totalPlannedMinutes = selectedTasks.reduce((sum, task) => sum + task.duration, 0);

  return {
    difficulty,
    timeBlocks,
    totalBlockMinutes,
    totalPlannedMinutes,
    selectedTasks,
  };
}
