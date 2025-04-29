
import { Json } from '@/integrations/supabase/types';
import { Strategy, mapJsonToStrategy, mapStrategyArray } from '@/types/strategy.d';

/**
 * Safely transforms data from API responses with proper typing
 */
export function transformData<T>(data: any, transformer: (data: any) => T): T {
  try {
    return transformer(data);
  } catch (error) {
    console.error('Error transforming data:', error);
    throw error;
  }
}

/**
 * Safely parses JSON strings, with fallback to empty object
 */
export function safeParseJson(jsonStr: string | Json): Record<string, any> {
  if (typeof jsonStr === 'string') {
    try {
      return JSON.parse(jsonStr);
    } catch (error) {
      console.error('Error parsing JSON:', error);
      return {};
    }
  } else if (jsonStr && typeof jsonStr === 'object') {
    return jsonStr as Record<string, any>;
  }
  return {};
}

/**
 * Transforms strategy data from API to properly typed Strategy objects
 */
export function transformStrategyData(data: any): Strategy {
  return mapJsonToStrategy(data);
}

/**
 * Transforms array of strategy data from API
 */
export function transformStrategyArray(data: any[]): Strategy[] {
  return mapStrategyArray(data);
}
