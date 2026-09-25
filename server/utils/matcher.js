/**
 * Skill Matching Utility for Student-Industry Bridge
 * 
 * Formula:
 * Student: React, Python, SQL
 * Project: React, Python, Java
 * Matched: React, Python (2)
 * Total Required: 3
 * Match % = 2 / 3 = 67%
 */

// Canonical alias dictionary for tech skills
const SKILL_ALIASES = {
  'js': 'javascript',
  'ts': 'typescript',
  'react.js': 'react',
  'reactjs': 'react',
  'node.js': 'node.js',
  'nodejs': 'node.js',
  'node': 'node.js',
  'py': 'python',
  'golang': 'go',
  'postgres': 'postgresql',
  'mongo': 'mongodb',
  'ml': 'machine learning',
  'ai': 'artificial intelligence',
  'ui/ux': 'ui/ux design',
  'k8s': 'kubernetes'
};

export function normalizeSkill(skill) {
  if (!skill) return '';
  const trimmed = skill.trim().toLowerCase();
  return SKILL_ALIASES[trimmed] || trimmed;
}

/**
 * Calculates skill match percentage and breakdown
 * @param {string[]} studentSkills 
 * @param {string[]} projectRequiredSkills 
 * @returns {object} { matchPercentage, matchedSkills, missingSkills, totalRequired }
 */
export function calculateSkillMatch(studentSkills = [], projectRequiredSkills = []) {
  if (!projectRequiredSkills || projectRequiredSkills.length === 0) {
    return {
      matchPercentage: 100,
      matchedSkills: [],
      missingSkills: [],
      totalRequired: 0,
      badge: 'Perfect Match'
    };
  }

  const normalizedStudentSkills = (studentSkills || []).map(s => ({
    original: s,
    norm: normalizeSkill(s)
  }));

  const matched = [];
  const missing = [];

  projectRequiredSkills.forEach(reqSkill => {
    const normReq = normalizeSkill(reqSkill);
    const found = normalizedStudentSkills.find(s => s.norm === normReq);
    if (found) {
      matched.push(reqSkill);
    } else {
      missing.push(reqSkill);
    }
  });

  const matchPercentage = Math.round((matched.length / projectRequiredSkills.length) * 100);

  let badge = 'Developing Match';
  let badgeColor = 'amber';
  if (matchPercentage >= 85) {
    badge = 'High Match';
    badgeColor = 'emerald';
  } else if (matchPercentage >= 60) {
    badge = 'Good Match';
    badgeColor = 'indigo';
  } else if (matchPercentage >= 40) {
    badge = 'Moderate Match';
    badgeColor = 'sky';
  }

  return {
    matchPercentage,
    matchedSkills: matched,
    missingSkills: missing,
    totalRequired: projectRequiredSkills.length,
    badge,
    badgeColor
  };
}
