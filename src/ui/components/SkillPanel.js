export function SkillPanel(skills=[], mp=0){
  return `<div class="skill-panel">${skills.map(skill=>`<button class="skill-button" data-skill-id="${skill.id}" ${mp<(skill.mpCost??0)?'disabled':''}><strong>${skill.name}</strong><small>MP ${skill.mpCost??0}</small></button>`).join('')}</div>`;
}
