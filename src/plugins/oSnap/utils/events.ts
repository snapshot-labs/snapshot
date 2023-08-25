import bb from 'bluebird';
// This state is meant for adjusting a start/end block when querying events. Some apis will fail if the range
// is too big, so the following functions will adjust range dynamically.
export type RangeState = {
  startBlock: number;
  endBlock: number;
  maxRange: number;
  currentRange: number;
  currentStart: number; // This is the start value you want for your query.
  currentEnd: number; // this is the end value you want for your query.
  done: boolean; // Signals we successfully queried the entire range.
  multiplier?: number; // Multiplier increases or decreases range by this value, depending on success or failure
};

/**
 * rangeStart. This starts a new range query and sets defaults for state.  Use this as the first call before starting your queries
 *
 * @param {Pick} state
 * @returns {RangeState}
 */
export function rangeStart(
  state: Pick<RangeState, 'startBlock' | 'endBlock' | 'multiplier'> & {
    maxRange?: number;
  }
): RangeState {
  const { startBlock, endBlock, multiplier = 2 } = state;
  if (state.maxRange && state.maxRange > 0) {
    const range = endBlock - startBlock;
    if (!(range >= 0)) {
      throw new Error('End block must be higher than start block');
    }
    const currentRange = Math.min(state.maxRange, range);
    const currentStart = endBlock - currentRange;
    const currentEnd = endBlock;
    return {
      done: false,
      startBlock,
      endBlock,
      maxRange: state.maxRange,
      currentRange,
      currentStart,
      currentEnd,
      multiplier
    };
  } else {
    // the largest range we can have, since this is the users query for start and end
    const maxRange = endBlock - startBlock;
    if (!(maxRange > 0)) {
      throw new Error('End block must be higher than start block');
    }
    const currentStart = startBlock;
    const currentEnd = endBlock;
    const currentRange = maxRange;

    return {
      done: false,
      startBlock,
      endBlock,
      maxRange,
      currentRange,
      currentStart,
      currentEnd,
      multiplier
    };
  }
}
/**
 * rangeSuccessDescending. We have 2 ways of querying events, from oldest to newest, or newest to oldest. Typically we want them in order, from
 * oldest to newest, but for this particular case we want them newest to oldest, ie descending ( larger timestamp to smaller timestamp).
 * This function will increase the range between start/end block and return a new start/end to use since by calling this you are signalling
 * that the last range ended in a successful query.
 *
 * @param {RangeState} state
 * @returns {RangeState}
 */
export function rangeSuccessDescending(state: RangeState): RangeState {
  const {
    startBlock,
    currentStart,
    maxRange,
    currentRange,
    multiplier = 2
  } = state;
  // we are done if we succeeded querying where the currentStart matches are initial start block
  const done = currentStart <= startBlock;
  // increase range up to max range for every successful query
  const nextRange = Math.min(Math.ceil(currentRange * multiplier), maxRange);
  // move our end point to the previously successful start, ie moving from newest to oldest
  const nextEnd = currentStart;
  // move our start block to the next range down
  const nextStart = Math.max(nextEnd - nextRange, startBlock);
  return {
    ...state,
    currentStart: nextStart,
    currentEnd: nextEnd,
    currentRange: nextRange,
    done
  };
}
/**
 * rangeFailureDescending. Like the previous function, this will decrease the range between start/end for your query, because you are signalling
 * that the last query failed. It will also keep the end of your range the same, while moving the start range up. This is why
 * its considered descending, it will attempt to move from end to start, rather than start to end.
 *
 * @param {RangeState} state
 * @returns {RangeState}
 */
export function rangeFailureDescending(state: RangeState): RangeState {
  const { startBlock, currentEnd, currentRange, multiplier = 2 } = state;
  const nextRange = Math.floor(currentRange / multiplier);
  // this will eventually throw an error if you keep calling this function, which protects us against re-querying a broken api in a loop
  if (currentRange <= 0) throw new Error('Current range must be above 0');
  if (!(nextRange > 0)) throw new Error('Range must be above 0');
  // we stay at the same end block
  const nextEnd = currentEnd;
  // move our start block closer to the end block, shrinking the range
  const nextStart = Math.max(nextEnd - nextRange, startBlock);
  return {
    ...state,
    currentStart: nextStart,
    currentEnd: nextEnd,
    currentRange: nextRange
  };
}

// The main interface to wrap the above pure functions up. requires you to pass in a generic function
// which returns the events based on a start/end block query.
export async function pageEvents<E>(
  startBlock: number,
  endBlock: number,
  maxRange: number,
  //start and end block range to query
  fetchEvents: (query: { start: number; end: number }) => Promise<E[]>,
  concurrency: number = 5
): Promise<E[]> {
  let state = rangeStart({ startBlock, endBlock, maxRange });
  const ranges: { start: number; end: number }[] = [];
  let index = 0;
  do {
    ranges.push({
      start: state.currentStart,
      end: state.currentEnd,
      index: index++
    });
    state = rangeSuccessDescending(state);
  } while (!state.done);

  return (await bb.map(ranges, fetchEvents, { concurrency })).flat();
}
