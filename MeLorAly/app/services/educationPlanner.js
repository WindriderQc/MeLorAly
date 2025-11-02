const { v4: uuidv4 } = require('uuid');
const {
  activities,
  getActivityById
} = require('../data/education-activities');

const WEEK_DAYS = [
  { key: 'monday', label: 'Lundi', offset: 0 },
  { key: 'tuesday', label: 'Mardi', offset: 1 },
  { key: 'wednesday', label: 'Mercredi', offset: 2 },
  { key: 'thursday', label: 'Jeudi', offset: 3 },
  { key: 'friday', label: 'Vendredi', offset: 4 },
  { key: 'saturday', label: 'Samedi', offset: 5 },
  { key: 'sunday', label: 'Dimanche', offset: 6 }
];

function startOfDay(date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function addDays(date, days) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

function differenceInDays(lateDate, earlyDate) {
  const diffMs = startOfDay(lateDate) - startOfDay(earlyDate);
  return Math.round(diffMs / (24 * 60 * 60 * 1000));
}

function toDateOnly(value) {
  if (!value) {
    return null;
  }
  try {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) {
      return null;
    }
    return d.toISOString().slice(0, 10);
  } catch (error) {
    return null;
  }
}

function formatIcsDate(date) {
  return startOfDay(date).toISOString().replace(/[-:]/g, '').slice(0, 15) + 'Z';
}

function calculateAge(birthDate) {
  if (!birthDate) {
    return null;
  }
  try {
    const birth = new Date(birthDate);
    if (Number.isNaN(birth.getTime())) {
      return null;
    }
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age -= 1;
    }
    return age;
  } catch (error) {
    return null;
  }
}

function ageMatchesRange(age, range) {
  if (age === null || age === undefined) {
    return true;
  }
  if (range.endsWith('+')) {
    const min = Number.parseInt(range, 10);
    return age >= min;
  }
  const [minStr, maxStr] = range.split('-');
  const min = Number.parseInt(minStr, 10);
  const max = Number.parseInt(maxStr, 10);
  if (Number.isNaN(min) || Number.isNaN(max)) {
    return true;
  }
  return age >= min && age <= max;
}

function getAgeBuckets(age) {
  if (age === null || age === undefined) {
    return ['all'];
  }
  return activities.reduce((buckets, activity) => {
    if (activity.ageRanges.some(range => ageMatchesRange(age, range))) {
      activity.ageRanges.forEach(range => {
        if (!buckets.includes(range)) {
          buckets.push(range);
        }
      });
    }
    return buckets;
  }, ['all']);
}

function calculateStreakMetrics(completions = []) {
  if (!Array.isArray(completions) || completions.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      lastCompletedAt: null
    };
  }

  const uniqueDates = Array.from(
    new Set(
      completions
        .map(item => toDateOnly(item.completed_at))
        .filter(Boolean)
    )
  ).sort(); // ASC

  if (uniqueDates.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      lastCompletedAt: null
    };
  }

  let longestStreak = 0;
  let streak = 0;
  let previousDate = null;

  uniqueDates.forEach(dateString => {
    if (!previousDate) {
      streak = 1;
    } else {
      const currentDate = new Date(dateString);
      const lastDate = new Date(previousDate);
      const delta = differenceInDays(currentDate, lastDate);
      if (delta === 1) {
        streak += 1;
      } else if (delta > 1) {
        streak = 1;
      }
    }
    previousDate = dateString;
    if (streak > longestStreak) {
      longestStreak = streak;
    }
  });

  const today = toDateOnly(new Date());
  const yesterday = toDateOnly(addDays(new Date(), -1));
  const descendingDates = uniqueDates.slice().reverse();

  let currentStreak = 0;
  if (descendingDates[0] === today) {
    currentStreak = 1;
    for (let i = 1; i < descendingDates.length; i += 1) {
      const currentDate = new Date(descendingDates[i - 1]);
      const previous = new Date(descendingDates[i]);
      if (differenceInDays(currentDate, previous) === 1) {
        currentStreak += 1;
      } else {
        break;
      }
    }
  } else if (descendingDates[0] === yesterday) {
    currentStreak = 0;
    for (let i = 0; i < descendingDates.length; i += 1) {
      const currentDate = new Date(descendingDates[i]);
      const target = i === 0 ? yesterday : new Date(descendingDates[i - 1]);
      if (differenceInDays(target, currentDate) === (i === 0 ? 0 : 1)) {
        currentStreak += 1;
      } else {
        break;
      }
    }
  }

  return {
    currentStreak,
    longestStreak,
    lastCompletedAt: descendingDates[0] || null
  };
}

function scoreActivityForChild(activity, context) {
  const { age, grade, completedActivityIds } = context;
  const matchesAge = activity.ageRanges.some(range => ageMatchesRange(age, range));
  if (!matchesAge) {
    return null;
  }

  let score = 10;

  if (!completedActivityIds.has(activity.id)) {
    score += 5;
  } else {
    score -= 3;
  }

  if (activity.recommended) {
    score += 3;
  }

  if (grade && activity.gradeLevels && activity.gradeLevels.includes(grade)) {
    score += 2;
  } else if (grade) {
    score -= 1;
  }

  if (activity.durationMinutes <= 20) {
    score += 1;
  }

  return score;
}

function rankActivitiesForChild(context) {
  return activities
    .map(activity => {
      const score = scoreActivityForChild(activity, context);
      if (score === null) {
        return null;
      }
      return {
        activity,
        score,
        alreadyCompleted: context.completedActivityIds.has(activity.id)
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score);
}

function startOfNextMonday() {
  const today = startOfDay(new Date());
  const day = today.getDay(); // 0 Sunday -> 6 Saturday
  const distanceToNextMonday = (8 - day) % 7;
  const offset = distanceToNextMonday === 0 ? 7 : distanceToNextMonday;
  return addDays(today, offset);
}

function buildWeeklyPlan(context, rankedActivities) {
  const planActivities = [];
  const usedSkillTags = new Set();

  rankedActivities.forEach(item => {
    if (planActivities.length >= WEEK_DAYS.length) {
      return;
    }

    // Prefer new activities first
    if (context.completedActivityIds.has(item.activity.id) && planActivities.length < 4) {
      return;
    }

    const hasOverlap = item.activity.skillTags?.some(tag => usedSkillTags.has(tag));
    if (hasOverlap && planActivities.length < 4) {
      return;
    }

    planActivities.push(item.activity);
    (item.activity.skillTags || []).forEach(tag => usedSkillTags.add(tag));
  });

  // If we did not fill enough slots, allow previously completed or overlapping skill tags
  if (planActivities.length < 4) {
    rankedActivities.forEach(item => {
      if (planActivities.length >= 4) {
        return;
      }
      if (!planActivities.includes(item.activity)) {
        planActivities.push(item.activity);
      }
    });
  }

  const weekStart = startOfNextMonday();

  const days = WEEK_DAYS.map((day, index) => {
    const activity = planActivities[index] || null;
    const date = addDays(weekStart, day.offset);
    return {
      key: day.key,
      label: day.label,
      dateIso: toDateOnly(date),
      activity
    };
  });

  return {
    generatedAt: new Date().toISOString(),
    startDate: toDateOnly(weekStart),
    days
  };
}

function buildChildProfiles(children = [], completions = []) {
  const completionsByChild = completions.reduce((acc, completion) => {
    if (!acc[completion.child_id]) {
      acc[completion.child_id] = [];
    }
    acc[completion.child_id].push(completion);
    return acc;
  }, {});

  return (children || []).map(child => {
    const age = calculateAge(child.birth_date);
    const childCompletions = (completionsByChild[child.id] || []).sort((a, b) => (
      new Date(a.completed_at) - new Date(b.completed_at)
    ));
    const metrics = calculateStreakMetrics(childCompletions);
    const completedActivityIds = new Set(childCompletions.map(item => item.activity_id));
    const context = {
      age,
      grade: child.grade || null,
      completedActivityIds
    };
    const rankedActivities = rankActivitiesForChild(context);
    const weeklyPlan = buildWeeklyPlan(context, rankedActivities);
    const recommendedActivities = rankedActivities.slice(0, 5).map(item => item.activity);

    return {
      child,
      age,
      ageBuckets: getAgeBuckets(age),
      metrics,
      completedActivityIds,
      recommendations: recommendedActivities,
      weeklyPlan,
      totalCompletions: childCompletions.length
    };
  });
}

function compileGlobalRecommendations(childProfiles = [], limit = 5) {
  const scoredMap = new Map();
  childProfiles.forEach(profile => {
    profile.recommendations.forEach((activity, index) => {
      if (!scoredMap.has(activity.id)) {
        scoredMap.set(activity.id, { activity, score: 100 - index, audience: new Set([profile.child.id]) });
      } else {
        const existing = scoredMap.get(activity.id);
        existing.score += (100 - index);
        existing.audience.add(profile.child.id);
      }
    });
  });

  return Array.from(scoredMap.values())
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(entry => ({
      ...entry.activity,
      audienceSize: entry.audience.size
    }));
}

function generateWeeklyPlanICS(childProfile, plan, options = {}) {
  if (!childProfile || !plan) {
    return '';
  }

  const childName = childProfile.child.name;
  const userEmail = options.userEmail || 'no-reply@meloraly.app';
  const dtStamp = formatIcsDate(new Date());

  const events = plan.days
    .filter(day => day.activity)
    .map(day => {
      const activity = getActivityById(day.activity.id) || day.activity;
      const dateValue = day.dateIso ? day.dateIso.replace(/-/g, '') : null;
      if (!dateValue) {
        return null;
      }
      const summary = `${childName} – ${activity.title}`;
      const description = (activity.summary || activity.description || '')
        .replace(/\r?\n/g, '\\n')
        .replace(/,/g, '\\,');

      return [
        'BEGIN:VEVENT',
        `UID:${uuidv4()}@meloraly`,
        `DTSTAMP:${dtStamp}`,
        `ORGANIZER;CN=MeLorAly:mailto:${userEmail}`,
        `DTSTART;VALUE=DATE:${dateValue}`,
        `SUMMARY:${summary}`,
        `DESCRIPTION:${description}`,
        `CATEGORIES:Education`,
        'TRANSP:OPAQUE',
        'END:VEVENT'
      ].join('\r\n');
    })
    .filter(Boolean);

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//MeLorAly//Education Planner//FR',
    events.join('\r\n'),
    'END:VCALENDAR'
  ].join('\r\n');
}

module.exports = {
  WEEK_DAYS,
  calculateAge,
  buildChildProfiles,
  compileGlobalRecommendations,
  generateWeeklyPlanICS
};
