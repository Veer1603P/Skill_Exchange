import { LEVEL_VALUE } from '../constants';

// Skills that `teacher` can teach `learner`:
// the teacher teaches it, the learner wants it, and the teacher's level is ABOVE the learner's level.
export const teachesMe = (me, other) =>
  other.teach.flatMap((t) => {
    const l = me.learn.find((x) => x.name === t.name);
    if (l && LEVEL_VALUE[t.level] > LEVEL_VALUE[l.level]) {
      return [{ name: t.name, teachLevel: t.level, learnLevel: l.level }];
    }
    return [];
  });

// What the other person can teach me, and what I can teach them
export const overlaps = (me, other) => ({
  theyTeach: teachesMe(me, other),
  theyWant: teachesMe(other, me),
});

// A reciprocal match needs both directions
export const isMatch = (me, other) => {
  const o = overlaps(me, other);
  return o.theyTeach.length > 0 && o.theyWant.length > 0;
};

// Match score = number of valid skill swaps in both directions (higher = better match).
export const matchScore = (me, other) => {
  const o = overlaps(me, other);
  return o.theyTeach.length + o.theyWant.length;
};

// The active (not declined) request between two users, if any.
export const relationWith = (requests, meId, otherId) =>
  requests.find(
    (r) =>
      r.status !== 'REJECTED' &&
      ((r.fromUser === meId && r.toUser === otherId) ||
        (r.fromUser === otherId && r.toUser === meId))
  ) || null;
