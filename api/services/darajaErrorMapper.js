/**
 * Safaricom Daraja M-Pesa Error Code Mapper
 * Converts numeric ResultCode and raw error strings into enterprise-grade,
 * human-readable titles, detailed explanations, and actionable user suggestions.
 */

export const DARAJA_ERROR_MAP = {
  0: {
    status: 'SUCCESS',
    title: 'Payment Successful',
    explanation: 'Your M-Pesa payment was confirmed and processed successfully.',
    suggestion: 'Your wallet balance has been updated.'
  },
  1: {
    status: 'FAILED',
    title: 'Insufficient M-Pesa Balance',
    explanation: 'Your M-Pesa account balance is not enough to complete this transaction.',
    suggestion: 'Top up your M-Pesa account balance and try again.'
  },
  1032: {
    status: 'CANCELLED',
    title: 'Payment Cancelled by User',
    explanation: 'You pressed Cancel or declined the M-Pesa PIN prompt on your phone.',
    suggestion: 'Click Trigger M-Pesa STK Push when you are ready to complete payment.'
  },
  1037: {
    status: 'CANCELLED',
    title: 'Payment Prompt Cancelled',
    explanation: 'The M-Pesa transaction prompt was cancelled on your mobile device.',
    suggestion: 'Unlock your mobile phone screen and re-trigger payment.'
  },
  1031: {
    status: 'TIMEOUT',
    title: 'M-Pesa PIN Timeout',
    explanation: 'You did not enter your M-Pesa PIN within the 60-second timeout window.',
    suggestion: 'Keep your mobile phone unlocked and enter your PIN immediately when the prompt appears.'
  },
  2001: {
    status: 'FAILED',
    title: 'Incorrect M-Pesa PIN',
    explanation: 'The M-Pesa PIN entered on your mobile phone was incorrect.',
    suggestion: 'Please verify your 4-digit PIN and re-initiate payment.'
  },
  1001: {
    status: 'FAILED',
    title: 'Safaricom Service Maintenance',
    explanation: 'Safaricom M-Pesa network is currently undergoing scheduled system maintenance.',
    suggestion: 'Please wait a few minutes before attempting payment again.'
  },
  1019: {
    status: 'FAILED',
    title: 'M-Pesa Daily Limit Exceeded',
    explanation: 'This payment exceeds your maximum daily M-Pesa transaction limit.',
    suggestion: 'Try a lower deposit amount or wait until your daily limit resets.'
  },
  1025: {
    status: 'FAILED',
    title: 'M-Pesa Account Balance Limit Exceeded',
    explanation: 'This transaction exceeds your maximum allowable M-Pesa account balance.',
    suggestion: 'Reduce your deposit amount and try again.'
  },
  1020: {
    status: 'FAILED',
    title: 'Safaricom System Busy',
    explanation: 'Safaricom M-Pesa payment servers are experiencing high traffic.',
    suggestion: 'Please wait a moment and try again.'
  },
  1026: {
    status: 'FAILED',
    title: 'Transaction Declined by Safaricom',
    explanation: 'Safaricom M-Pesa system declined this payment request.',
    suggestion: 'Ensure your M-Pesa line is active and registered for mobile payments.'
  }
};

/**
 * Maps a raw Daraja ResultCode or error string to a structured error object.
 */
export function mapDarajaError(resultCode, rawMessage = '') {
  const code = parseInt(resultCode, 10);

  if (DARAJA_ERROR_MAP[code]) {
    return DARAJA_ERROR_MAP[code];
  }

  const messageLower = String(rawMessage).toLowerCase();

  if (messageLower.includes('unresolved reason') || messageLower.includes('unresolved')) {
    return {
      status: 'CANCELLED',
      title: 'M-Pesa Prompt Cancelled / Closed',
      explanation: 'The M-Pesa PIN prompt was cancelled or closed on your mobile handset before PIN confirmation.',
      suggestion: 'Ensure your phone screen is unlocked, keep your SIM active, and enter your M-Pesa PIN promptly.'
    };
  }

  if (messageLower.includes('cancel')) {
    return {
      status: 'CANCELLED',
      title: 'Payment Cancelled',
      explanation: 'The M-Pesa payment request was cancelled on your phone.',
      suggestion: 'Click Trigger M-Pesa STK Push to try again.'
    };
  }

  if (messageLower.includes('timeout') || messageLower.includes('time out')) {
    return {
      status: 'TIMEOUT',
      title: 'Transaction Timeout',
      explanation: 'Safaricom did not receive your PIN within the response window.',
      suggestion: 'Keep your phone ready and enter your M-Pesa PIN promptly.'
    };
  }

  if (messageLower.includes('pin') || messageLower.includes('wrong')) {
    return {
      status: 'FAILED',
      title: 'Incorrect M-Pesa PIN',
      explanation: 'The PIN entered on your mobile device was incorrect.',
      suggestion: 'Double-check your PIN and retry the transaction.'
    };
  }

  if (messageLower.includes('balance') || messageLower.includes('fund')) {
    return {
      status: 'FAILED',
      title: 'Insufficient Funds',
      explanation: 'Your M-Pesa balance is insufficient to complete KES deposit.',
      suggestion: 'Top up your M-Pesa balance and retry.'
    };
  }

  return {
    status: 'FAILED',
    title: 'M-Pesa Payment Failed',
    explanation: rawMessage || 'Safaricom M-Pesa was unable to process this payment.',
    suggestion: 'Verify your phone number and try again.'
  };
}
