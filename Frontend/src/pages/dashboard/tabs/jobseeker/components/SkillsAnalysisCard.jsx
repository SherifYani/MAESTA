import React from 'react';
import { Target, Award } from 'lucide-react';
import Button from '../../../components/ui/Button';
import styles from '../JobseekerDashboard.module.css';

/**
 * SkillsAnalysisCard Component
 * @description Renders a skills analysis overview with premium progress bars
 */
const SkillsAnalysisCard = ({ skillsAnalysis = {}, onEdit = () => {}, onAssess = () => {} }) => {
  const topSkills = skillsAnalysis.topSkills || [
    { name: 'UI/UX Design', level: 92 },
    { name: 'React Development', level: 85 },
    { name: 'Product Strategy', level: 78 }
  ];

  return (
    <div className={styles.skillsCardSection}>
      <div className={styles.skillsGrid}>
        {topSkills.map((skill, index) => (
          <div key={index} className={styles.skillItem}>
            <div className={styles.skillHeader}>
              <div className={styles.skillLabel}>
                 <Target size={14} className={styles.skillIcon} />
                 {skill.name}
              </div>
              <span className={styles.skillPercentage}>{skill.level}%</span>
            </div>
            <div className={styles.skillProgress}>
              <div className={styles.skillFill} style={{ width: `${skill.level}%` }} />
            </div>
          </div>
        ))}
      </div>

      <div className={styles.skillsFooter}>
        <Button 
          variant="outline" 
          size="small" 
          onClick={onAssess}
          className={styles.skillAssessmentBtn}
        >
          <Award size={14} /> Take Skill Assessment
        </Button>
      </div>
    </div>
  );
};

export default SkillsAnalysisCard;
