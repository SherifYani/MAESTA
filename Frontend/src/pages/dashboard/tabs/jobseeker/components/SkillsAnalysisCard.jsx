/**
 * @file SkillsAnalysisCard.jsx
 * @description Skills analysis visualization
 * @author Sherif Talaat
 */
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import styles from '../JobseekerDashboard.module.css';

const getSkillLevel = (percentage) => {
    if (percentage >= 85) return "expert";
    if (percentage >= 70) return "advanced";
    if (percentage >= 50) return "intermediate";
    return "beginner";
};

const SkillsAnalysisCard = ({ skillsAnalysis, onEdit, onAssess }) => {
    const skillData = skillsAnalysis.matchedSkills?.slice(0, 4).map(skill => ({
        label: skill.name,
        percentage: skill.level || 70,
        level: getSkillLevel(skill.level || 70),
        demand: skill.demand || "High"
    })) || [];

    return (
        <Card
            title="Skill Analysis"
            subtitle={`Overall match: ${skillsAnalysis.overallMatch || 87}%`}
            className={styles.skillsCard}
            variant="glass"
            action={
                <Button
                    variant="ghost"
                    size="small"
                    onClick={onEdit}
                    className={styles.editBtn}
                >
                    Edit Skills
                </Button>
            }
        >
            <div className={styles.skillsGrid}>
                {skillData.map((skill, index) => (
                    <div
                        key={index}
                        className={styles.skillItem}
                    >
                        <div className={styles.skillHeader}>
                            <span className={styles.skillLabel}>
                                {skill.label}
                                {skill.demand && (
                                    <Badge
                                        variant="outline"
                                        size="xs"
                                        className={styles.demandBadge}
                                    >
                                        {skill.demand}
                                    </Badge>
                                )}
                            </span>
                            <span className={styles.skillPercentage}>
                                {skill.percentage}%
                            </span>
                        </div>
                        <div className={styles.skillProgress}>
                            <div
                                className={styles.skillFill}
                                style={{ width: `${skill.percentage}%` }}
                            />
                        </div>
                        <div className={styles.skillLevel}>
                            <Badge variant={skill.level}>{skill.level}</Badge>
                        </div>
                    </div>
                ))}
            </div>
            {skillsAnalysis.recommendations && (
                <div className={styles.skillsRecommendations}>
                    <h5>Recommendations:</h5>
                    <ul>
                        {skillsAnalysis.recommendations.slice(0, 2).map((rec, idx) => (
                            <li key={idx}>{rec}</li>
                        ))}
                    </ul>
                </div>
            )}
            <div className={styles.skillsFooter}>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={onAssess}
                    className={styles.skillAssessmentBtn}
                >
                    Take Skill Assessment
                </Button>
            </div>
        </Card>
    );
};

export default SkillsAnalysisCard;
