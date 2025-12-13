'use client';

import { MonthlyResult } from '@/lib/api';
import RadarChart from './RadarChart';
import StatCard from './StatCard';

interface MonthlyDashboardProps {
  result: MonthlyResult;
  onClose: () => void;
}

export default function MonthlyDashboard({ result, onClose }: MonthlyDashboardProps) {
  const skills = Object.entries(result.skills).map(([name, score]) => ({ name, score }));

  const radarData = {
    labels: Object.keys(result.skills),
    values: Object.values(result.skills),
  };

  // Find highest and lowest skills
  const sortedSkills = [...skills].sort((a, b) => b.score - a.score);
  const highestSkill = sortedSkills[0];
  const lowestSkill = sortedSkills[sortedSkills.length - 1];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-bold">
          {result.year}年{result.month}月の結果
        </h2>
        <button
          onClick={onClose}
          className="px-5 py-2.5 border-2 border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
        >
          閉じる
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <StatCard
          label="総合レベル"
          value={`Lv.${result.level}`}
          change=""
        />
        <StatCard
          label="最高スコア能力"
          value={highestSkill.name}
          change={`Lv.${Math.floor(highestSkill.score / 20) + 1} (${highestSkill.score}点)`}
        />
        <StatCard
          label="最低スコア能力"
          value={lowestSkill.name}
          change={`${lowestSkill.score}点`}
          changeType="negative"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="card">
          <h3 className="card-title">非認知能力レーダーチャート</h3>
          <div className="h-80">
            <RadarChart data={radarData} />
          </div>
        </div>

        <div className="card">
          <h3 className="card-title">能力別スコア</h3>
          <div className="space-y-3">
            {skills.map((skill) => (
              <div key={skill.name} className="skill-item">
                <span className="skill-name w-32 flex-shrink-0">{skill.name}</span>
                <div className="skill-bar-container">
                  <div className="skill-bar" style={{ width: `${skill.score}%` }} />
                </div>
                <span className="skill-score">{skill.score}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {result.ai_comment && (
        <div className="card mt-5">
          <h3 className="card-title">AIからのコメント</h3>
          <div className="bg-indigo-50 border-l-4 border-indigo-600 p-5 rounded-r-xl">
            <p className="text-gray-700 whitespace-pre-wrap">{result.ai_comment}</p>
          </div>
        </div>
      )}
    </div>
  );
}
