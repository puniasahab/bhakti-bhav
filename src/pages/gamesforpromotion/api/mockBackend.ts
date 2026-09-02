// mockBackend.ts
// Simulates a backend service for the Divine Blessing app

const REWARDS = [
  { discount: 9, probability: 40 },
  { discount: 11, probability: 25 },
  { discount: 15, probability: 15 },
  { discount: 21, probability: 10 },
  { discount: 31, probability: 5 },
  { discount: 51, probability: 3 },
  { discount: 75, probability: 1.5 },
  { discount: 100, probability: 0.5 },
];

export interface RewardInfo {
  discount: number;
  sessionId: string;
}

export interface ClaimResult {
  success: boolean;
  couponCode?: string;
  message: string;
}

// Generate a random session ID
const generateSessionId = () => Math.random().toString(36).substring(2, 15);

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const determineReward = async (): Promise<RewardInfo> => {
  await delay(1500); // Simulate API latency
  
  const rand = Math.random() * 100;
  let cumulative = 0;
  let selectedDiscount = 9; // Default fallback

  for (const reward of REWARDS) {
    cumulative += reward.probability;
    if (rand <= cumulative) {
      selectedDiscount = reward.discount;
      break;
    }
  }

  return {
    discount: selectedDiscount,
    sessionId: generateSessionId()
  };
};

export const verifyOTPAndGenerateCoupon = async (
  phone: string, 
  otp: string, 
  _sessionId: string, 
  discount: number
): Promise<ClaimResult> => {
  await delay(2000); // Simulate verification & generation latency

  // Mock OTP validation (accept anything for demo, or hardcode like '123456')
  if (otp.length !== 6) {
    return { success: false, message: 'Invalid OTP format.' };
  }

  // Generate unique coupon
  const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
  const couponCode = `KRSH${discount}X${randomSuffix}`;

  return {
    success: true,
    couponCode,
    message: 'Coupon generated successfully and linked to ' + phone
  };
};
