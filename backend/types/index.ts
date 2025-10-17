// TypeScript Type Definitions for LearnPathAI Data Models

export type UUID = string;
export type Timestamp = string;

export interface UserProfile {
  fullName: string;
  avatarUrl?: string;
  joinCohort?: string;
  department?: string;
  [key: string]: any;
}

export interface User {
  userId: UUID;
  username: string;
  role: "learner" | "teacher" | "admin";
  signupAt: Timestamp;
  profile: UserProfile;
}

export interface QuizQuestion {
  qid: string;
  question: string;
  options: string[];
  correct: string;
  explanation?: string;
}

export interface Resource {
  resourceId: UUID;
  type: "video" | "reading" | "quiz" | "interactive";
  title: string;
  durationSecs?: number;
  transcript?: string;
  text?: string;
  questions?: QuizQuestion[];
  url?: string;
}

export interface PathNode {
  nodeId: UUID;
  concept: string;
  resourceIds: UUID[];
  prerequisites: UUID[];
}

export interface LearningPath {
  pathId: UUID;
  userId: UUID;
  title: string;
  createdAt: Timestamp;
  nodes: UUID[];
}

export interface NodeAttempt {
  attemptId: UUID;
  userId: UUID;
  nodeId: UUID;
  startedAt: Timestamp;
  endedAt: Timestamp;
  outcome: "pass" | "fail";
  hintsUsed: number;
  scorePct: number;
}

export interface Badge {
  badgeId: UUID;
  name: string;
  criteria: string;
  icon: string;
}

export interface UserBadge {
  userId: UUID;
  badgeId: UUID;
  awardedAt: Timestamp;
}

export interface TokenType {
  tokenType: string; // e.g. "LEARN"
  name: string;
  symbol: string;
  decimals?: number;
}

export interface TokenBalance {
  userId: UUID;
  tokenType: string;
  balance: number;
}

export interface TokenTransaction {
  txId: UUID;
  userFrom?: UUID;
  userTo?: UUID;
  tokenType: string;
  amount: number;
  reason: string;
  timestamp: Timestamp;
  onchainHash?: string;
}

export interface NFTMint {
  nftId: UUID;
  owner: UUID;
  badgeId: UUID;
  mintedAt: Timestamp;
  txHash?: string;
}

export interface SocialPost {
  postId: UUID;
  userId: UUID;
  targetNode?: UUID;
  content: string;
  timestamp: Timestamp;
}

export interface Comment {
  commentId: UUID;
  postId: UUID;
  userId: UUID;
  content: string;
  timestamp: Timestamp;
}

export interface PeerReview {
  peerReviewId: UUID;
  reviewer: UUID;
  reviewee: UUID;
  nodeId: UUID;
  score: number;
  feedback: string;
  timestamp: Timestamp;
}

export interface PostReaction {
  postId: UUID;
  userId: UUID;
  reaction: string;
  timestamp: Timestamp;
}

export interface OverrideAction {
  overrideId: UUID;
  teacherId: UUID;
  userId: UUID;
  oldNode: UUID;
  newNode: UUID;
  reason: string;
  timestamp: Timestamp;
}

export interface ExplanationRecord {
  explanationId: UUID;
  userId: UUID;
  nodeId: UUID;
  resourceId: UUID;
  explanationText: string;
  evidenceSnippet: string;
  generatedAt: Timestamp;
}

export interface DecisionLog {
  decisionId: UUID;
  userId: UUID;
  timestamp: Timestamp;
  inputMastery: { [nodeId: UUID]: number };
  candidatePaths: UUID[][];
  chosenPath: UUID[];
  confidence: number;
}

// Collaboration / Group interfaces
export interface StudyGroup {
  groupId: UUID;
  name: string;
  memberIds: UUID[];
  createdAt: Timestamp;
}

export interface GroupChallenge {
  challengeId: UUID;
  groupId: UUID;
  title: string;
  targetNode: UUID;
  rewardTokens: number;
  startTime: Timestamp;
  endTime: Timestamp;
}

export interface GroupSubmission {
  submissionId: UUID;
  groupId: UUID;
  nodeId: UUID;
  submitter: UUID;
  completedAt: Timestamp;
  outcome: "pass" | "fail";
}

export interface GroupReward {
  grId: UUID;
  groupId: UUID;
  tokenType: string;
  amount: number;
  distributed: boolean;
  distributions: { userId: UUID; amount: number }[];
  timestamp: Timestamp;
  onchainHash?: string;
}

// Badge Metadata (for IPFS)
export interface BadgeMetadata {
  name: string;
  description: string;
  image: string;
  attributes: {
    trait_type: string;
    value: string | number;
  }[];
}

// Full Data Schema
export interface LearnPathAIData {
  users: User[];
  learning_paths: LearningPath[];
  path_nodes: PathNode[];
  resources: Resource[];
  attempts: NodeAttempt[];
  badges: Badge[];
  user_badges: UserBadge[];
  token_types: TokenType[];
  token_balances: TokenBalance[];
  token_transactions: TokenTransaction[];
  nft_mints: NFTMint[];
  social_posts: SocialPost[];
  comments: Comment[];
  peer_reviews: PeerReview[];
  post_reactions: PostReaction[];
  override_actions: OverrideAction[];
  explanations: ExplanationRecord[];
  decision_logs: DecisionLog[];
  study_groups: StudyGroup[];
  group_challenges: GroupChallenge[];
  group_submissions: GroupSubmission[];
  group_rewards: GroupReward[];
}

