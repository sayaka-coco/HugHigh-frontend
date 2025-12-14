'use client';

import { useState, useEffect } from 'react';
import { Plus, FolderOpen, ChevronRight, X, Users, FileText, Link, Book, ClipboardList, ArrowLeft, Edit3, Check, ChevronDown } from 'lucide-react';
import { studentAPI, Student } from '@/lib/api';

// Types
interface TeamMember {
  id: string;
  name: string;
}

interface WebResource {
  id: string;
  url: string;
  title: string;
  date: string;
  summary: string;
}

interface LiteratureResource {
  id: string;
  title: string;
  author: string;
  publisher: string;
  publishDate: string;
  summary: string;
}

interface SurveyResource {
  id: string;
  type: 'survey' | 'hearing';
  title: string;
  link: string;
  period: string;
  target: string;
  summary: string;
}

interface Project {
  id: string;
  name: string;
  theme: string;
  background: string;
  hypothesis: string;
  presentationUrl: string;
  teamMembers: TeamMember[];
  webResources: WebResource[];
  literatureResources: LiteratureResource[];
  surveyResources: SurveyResource[];
  createdAt: string;
  updatedAt: string;
}

interface ProjectManagerProps {
  userId: string;
}

export default function ProjectManager({ userId }: ProjectManagerProps) {
  // State for projects
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  // State for resource registration
  const [resourceTab, setResourceTab] = useState<'web' | 'literature' | 'survey'>('web');
  const [showRegisteredResources, setShowRegisteredResources] = useState(false);

  // Resource form states
  const [webForm, setWebForm] = useState<Omit<WebResource, 'id'>>({ url: '', title: '', date: '', summary: '' });
  const [literatureForm, setLiteratureForm] = useState<Omit<LiteratureResource, 'id'>>({ title: '', author: '', publisher: '', publishDate: '', summary: '' });
  const [surveyForm, setSurveyForm] = useState<Omit<SurveyResource, 'id'>>({ type: 'survey', title: '', link: '', period: '', target: '', summary: '' });

  // Students state
  const [students, setStudents] = useState<Student[]>([]);
  const [showStudentDropdown, setShowStudentDropdown] = useState(false);
  const [studentSearch, setStudentSearch] = useState('');

  // Load data from localStorage and fetch students on mount
  useEffect(() => {
    const savedProjects = localStorage.getItem(`projects_${userId}`);

    if (savedProjects) {
      const parsedProjects = JSON.parse(savedProjects);
      setProjects(parsedProjects);
    }

    // Fetch students from API
    const fetchStudents = async () => {
      try {
        const data = await studentAPI.getStudents();
        setStudents(data);
      } catch (error) {
        console.error('Failed to fetch students:', error);
      }
    };
    fetchStudents();
  }, [userId]);

  // Create new project
  const handleCreateProject = () => {
    const newProject: Project = {
      id: Date.now().toString(),
      name: '',
      theme: '',
      background: '',
      hypothesis: '',
      presentationUrl: '',
      teamMembers: [],
      webResources: [],
      literatureResources: [],
      surveyResources: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setEditingProject(newProject);
    setShowProjectForm(true);
  };

  // Save project
  const handleSaveProject = () => {
    if (!editingProject) return;

    const updatedProject = { ...editingProject, updatedAt: new Date().toISOString() };
    let updatedProjects: Project[];

    const existingIndex = projects.findIndex(p => p.id === editingProject.id);
    if (existingIndex >= 0) {
      updatedProjects = [...projects];
      updatedProjects[existingIndex] = updatedProject;
    } else {
      updatedProjects = [...projects, updatedProject];
    }

    setProjects(updatedProjects);
    setSelectedProject(updatedProject);
    localStorage.setItem(`projects_${userId}`, JSON.stringify(updatedProjects));
    setShowProjectForm(false);
    setEditingProject(null);
    alert('プロジェクトを保存しました！');
  };

  // Add team member from students
  const handleAddTeamMember = (student: Student) => {
    if (!editingProject) return;

    // Check if already added
    if (editingProject.teamMembers.some(m => m.id === student.id)) {
      alert('このメンバーは既に追加されています');
      return;
    }

    const newMember: TeamMember = {
      id: student.id,
      name: student.name,
    };

    setEditingProject({
      ...editingProject,
      teamMembers: [...editingProject.teamMembers, newMember],
    });
    setShowStudentDropdown(false);
    setStudentSearch('');
  };

  // Remove team member
  const handleRemoveTeamMember = (memberId: string) => {
    if (!editingProject) return;
    setEditingProject({
      ...editingProject,
      teamMembers: editingProject.teamMembers.filter(m => m.id !== memberId),
    });
  };

  // Filter students by search
  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
    s.email.toLowerCase().includes(studentSearch.toLowerCase())
  );

  // Add resource to selected project
  const handleAddResource = () => {
    if (!selectedProject) return;

    let updatedProject = { ...selectedProject };

    if (resourceTab === 'web') {
      if (!webForm.url || !webForm.title) {
        alert('URLとタイトルは必須です');
        return;
      }
      const newResource: WebResource = { ...webForm, id: Date.now().toString() };
      updatedProject.webResources = [...updatedProject.webResources, newResource];
      setWebForm({ url: '', title: '', date: '', summary: '' });
    } else if (resourceTab === 'literature') {
      if (!literatureForm.title) {
        alert('資料名は必須です');
        return;
      }
      const newResource: LiteratureResource = { ...literatureForm, id: Date.now().toString() };
      updatedProject.literatureResources = [...updatedProject.literatureResources, newResource];
      setLiteratureForm({ title: '', author: '', publisher: '', publishDate: '', summary: '' });
    } else {
      if (!surveyForm.title) {
        alert('タイトルは必須です');
        return;
      }
      const newResource: SurveyResource = { ...surveyForm, id: Date.now().toString() };
      updatedProject.surveyResources = [...updatedProject.surveyResources, newResource];
      setSurveyForm({ type: 'survey', title: '', link: '', period: '', target: '', summary: '' });
    }

    updatedProject.updatedAt = new Date().toISOString();
    const updatedProjects = projects.map(p => p.id === selectedProject.id ? updatedProject : p);
    setProjects(updatedProjects);
    setSelectedProject(updatedProject);
    localStorage.setItem(`projects_${userId}`, JSON.stringify(updatedProjects));
    alert('資料を登録しました！');
  };

  // Delete resource
  const handleDeleteResource = (type: 'web' | 'literature' | 'survey', resourceId: string) => {
    if (!selectedProject) return;

    let updatedProject = { ...selectedProject };

    if (type === 'web') {
      updatedProject.webResources = updatedProject.webResources.filter(r => r.id !== resourceId);
    } else if (type === 'literature') {
      updatedProject.literatureResources = updatedProject.literatureResources.filter(r => r.id !== resourceId);
    } else {
      updatedProject.surveyResources = updatedProject.surveyResources.filter(r => r.id !== resourceId);
    }

    updatedProject.updatedAt = new Date().toISOString();
    const updatedProjects = projects.map(p => p.id === selectedProject.id ? updatedProject : p);
    setProjects(updatedProjects);
    setSelectedProject(updatedProject);
    localStorage.setItem(`projects_${userId}`, JSON.stringify(updatedProjects));
  };

  // Project Detail View
  if (selectedProject && !showProjectForm) {
    const totalResources = selectedProject.webResources.length +
                          selectedProject.literatureResources.length +
                          selectedProject.surveyResources.length;

    return (
      <div className="space-y-6">
        {/* Header with back button */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSelectedProject(null)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <h3 className="text-xl font-bold">{selectedProject.name || '無題のプロジェクト'}</h3>
          <button
            onClick={() => {
              setEditingProject(selectedProject);
              setShowProjectForm(true);
            }}
            className="ml-auto px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg font-medium flex items-center gap-2"
          >
            <Edit3 size={18} />
            編集
          </button>
        </div>

        {/* Project Info */}
        <div className="card">
          <h4 className="card-title">探究活動の概要</h4>
          <div className="space-y-4">
            {selectedProject.theme && (
              <div>
                <span className="text-sm font-semibold text-gray-500">テーマ</span>
                <p className="text-gray-800 mt-1">{selectedProject.theme}</p>
              </div>
            )}
            {selectedProject.background && (
              <div>
                <span className="text-sm font-semibold text-gray-500">背景</span>
                <p className="text-gray-700 whitespace-pre-wrap mt-1">{selectedProject.background}</p>
              </div>
            )}
            {selectedProject.hypothesis && (
              <div>
                <span className="text-sm font-semibold text-gray-500">仮説</span>
                <p className="text-gray-700 whitespace-pre-wrap mt-1">{selectedProject.hypothesis}</p>
              </div>
            )}
            {selectedProject.presentationUrl && (
              <div>
                <span className="text-sm font-semibold text-gray-500">最終発表資料</span>
                <a
                  href={selectedProject.presentationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline block mt-1"
                >
                  {selectedProject.presentationUrl}
                </a>
              </div>
            )}
            {selectedProject.teamMembers.length > 0 && (
              <div>
                <span className="text-sm font-semibold text-gray-500">チームメンバー</span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedProject.teamMembers.map((member) => (
                    <span key={member.id} className="px-3 py-1.5 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                      {member.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {!selectedProject.theme && !selectedProject.background && !selectedProject.hypothesis && (
              <p className="text-gray-500 text-center py-4">まだ情報が登録されていません</p>
            )}
          </div>
        </div>

        {/* Resource Registration Section */}
        <div className="card">
          <h4 className="card-title">参考資料登録</h4>
          <p className="text-gray-600 text-sm mb-4">このプロジェクトに関連する参考資料を登録できます。</p>

          {/* Resource Tabs */}
          <div className="border-b mb-4">
            <div className="flex gap-6">
              <button
                onClick={() => setResourceTab('web')}
                className={`pb-2 font-medium transition-colors ${
                  resourceTab === 'web'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Web資料
              </button>
              <button
                onClick={() => setResourceTab('literature')}
                className={`pb-2 font-medium transition-colors ${
                  resourceTab === 'literature'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                文献資料
              </button>
              <button
                onClick={() => setResourceTab('survey')}
                className={`pb-2 font-medium transition-colors ${
                  resourceTab === 'survey'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                情報収集
              </button>
            </div>
          </div>

          {/* Web Resource Form */}
          {resourceTab === 'web' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">URL</label>
                  <input
                    type="url"
                    value={webForm.url}
                    onChange={(e) => setWebForm({ ...webForm, url: e.target.value })}
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                    placeholder="https://example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">日付</label>
                  <input
                    type="date"
                    value={webForm.date}
                    onChange={(e) => setWebForm({ ...webForm, date: e.target.value })}
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">タイトル</label>
                <input
                  type="text"
                  value={webForm.title}
                  onChange={(e) => setWebForm({ ...webForm, title: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                  placeholder="例：効果的な時間管理術"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">概要/主要なポイント</label>
                <textarea
                  value={webForm.summary}
                  onChange={(e) => setWebForm({ ...webForm, summary: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 min-h-[100px] resize-y"
                  placeholder="例：この記事では、ポモドーロテクニックの具体的な実践方法について解説しています。"
                />
              </div>
            </div>
          )}

          {/* Literature Resource Form */}
          {resourceTab === 'literature' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">資料名</label>
                <input
                  type="text"
                  value={literatureForm.title}
                  onChange={(e) => setLiteratureForm({ ...literatureForm, title: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                  placeholder="例：7つの習慣"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">著者</label>
                  <input
                    type="text"
                    value={literatureForm.author}
                    onChange={(e) => setLiteratureForm({ ...literatureForm, author: e.target.value })}
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                    placeholder="例：スティーブン・R・コヴィ"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">出版社</label>
                  <input
                    type="text"
                    value={literatureForm.publisher}
                    onChange={(e) => setLiteratureForm({ ...literatureForm, publisher: e.target.value })}
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                    placeholder="例：キングベアー出版"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">出版年月日</label>
                  <input
                    type="date"
                    value={literatureForm.publishDate}
                    onChange={(e) => setLiteratureForm({ ...literatureForm, publishDate: e.target.value })}
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">概要/主要なポイント</label>
                <textarea
                  value={literatureForm.summary}
                  onChange={(e) => setLiteratureForm({ ...literatureForm, summary: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 min-h-[100px] resize-y"
                  placeholder="例：主体性を発揮し、目的を持って行動することの重要性について述べられている"
                />
              </div>
            </div>
          )}

          {/* Survey Resource Form */}
          {resourceTab === 'survey' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">種別</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="surveyType"
                      checked={surveyForm.type === 'survey'}
                      onChange={() => setSurveyForm({ ...surveyForm, type: 'survey' })}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span>アンケート</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="surveyType"
                      checked={surveyForm.type === 'hearing'}
                      onChange={() => setSurveyForm({ ...surveyForm, type: 'hearing' })}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span>ヒアリング</span>
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  {surveyForm.type === 'survey' ? 'アンケートタイトル' : 'ヒアリングタイトル'}
                </label>
                <input
                  type="text"
                  value={surveyForm.title}
                  onChange={(e) => setSurveyForm({ ...surveyForm, title: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                  placeholder={surveyForm.type === 'survey' ? '例：チームのコミュニケーションに関するアンケート' : '例：○○さんへのヒアリング'}
                />
              </div>
              {surveyForm.type === 'survey' && (
                <div>
                  <label className="block text-sm font-medium mb-1">アンケートリンク</label>
                  <input
                    type="url"
                    value={surveyForm.link}
                    onChange={(e) => setSurveyForm({ ...surveyForm, link: e.target.value })}
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                    placeholder="https://forms.example/survey"
                  />
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">実施期間</label>
                  <input
                    type="text"
                    value={surveyForm.period}
                    onChange={(e) => setSurveyForm({ ...surveyForm, period: e.target.value })}
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                    placeholder="例：2023-04-01 〜 2023-04-15"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">対象者</label>
                  <input
                    type="text"
                    value={surveyForm.target}
                    onChange={(e) => setSurveyForm({ ...surveyForm, target: e.target.value })}
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                    placeholder="例：○○部署のメンバー"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">概要/主要なポイント</label>
                <textarea
                  value={surveyForm.summary}
                  onChange={(e) => setSurveyForm({ ...surveyForm, summary: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 min-h-[100px] resize-y"
                  placeholder="例：アンケートの目的や、得られた主要なインサイトを記述します。"
                />
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 mt-4">
            <button
              onClick={handleAddResource}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              登録
            </button>
          </div>

          {/* View Registered Resources Button */}
          <div className="mt-6 pt-4 border-t">
            <button
              onClick={() => setShowRegisteredResources(!showRegisteredResources)}
              className="w-full py-3 bg-blue-50 text-blue-600 rounded-lg font-semibold hover:bg-blue-100 transition-colors flex items-center justify-center gap-2"
            >
              <FileText size={18} />
              登録済み資料を確認する ({totalResources}件)
            </button>
          </div>

          {/* Registered Resources Display */}
          {showRegisteredResources && (
            <div className="mt-4 space-y-4">
              {/* Web Resources */}
              {selectedProject.webResources.length > 0 && (
                <div>
                  <h5 className="font-semibold mb-2 flex items-center gap-2">
                    <Link size={16} />
                    Web資料 ({selectedProject.webResources.length})
                  </h5>
                  <div className="space-y-2">
                    {selectedProject.webResources.map((resource) => (
                      <div key={resource.id} className="p-3 bg-gray-50 rounded-lg flex items-start justify-between">
                        <div className="flex-1">
                          <a href={resource.url} target="_blank" rel="noopener noreferrer" className="font-medium text-blue-600 hover:underline">
                            {resource.title}
                          </a>
                          {resource.date && <p className="text-xs text-gray-500">{resource.date}</p>}
                          {resource.summary && <p className="text-sm text-gray-600 mt-1">{resource.summary}</p>}
                        </div>
                        <button
                          onClick={() => handleDeleteResource('web', resource.id)}
                          className="text-gray-400 hover:text-red-500 ml-2"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Literature Resources */}
              {selectedProject.literatureResources.length > 0 && (
                <div>
                  <h5 className="font-semibold mb-2 flex items-center gap-2">
                    <Book size={16} />
                    文献資料 ({selectedProject.literatureResources.length})
                  </h5>
                  <div className="space-y-2">
                    {selectedProject.literatureResources.map((resource) => (
                      <div key={resource.id} className="p-3 bg-gray-50 rounded-lg flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium">{resource.title}</p>
                          <p className="text-xs text-gray-500">
                            {[resource.author, resource.publisher, resource.publishDate].filter(Boolean).join(' / ')}
                          </p>
                          {resource.summary && <p className="text-sm text-gray-600 mt-1">{resource.summary}</p>}
                        </div>
                        <button
                          onClick={() => handleDeleteResource('literature', resource.id)}
                          className="text-gray-400 hover:text-red-500 ml-2"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Survey Resources */}
              {selectedProject.surveyResources.length > 0 && (
                <div>
                  <h5 className="font-semibold mb-2 flex items-center gap-2">
                    <ClipboardList size={16} />
                    情報収集 ({selectedProject.surveyResources.length})
                  </h5>
                  <div className="space-y-2">
                    {selectedProject.surveyResources.map((resource) => (
                      <div key={resource.id} className="p-3 bg-gray-50 rounded-lg flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium">
                            <span className={`text-xs px-2 py-0.5 rounded mr-2 ${resource.type === 'survey' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'}`}>
                              {resource.type === 'survey' ? 'アンケート' : 'ヒアリング'}
                            </span>
                            {resource.title}
                          </p>
                          <p className="text-xs text-gray-500">
                            {[resource.period, resource.target].filter(Boolean).join(' / ')}
                          </p>
                          {resource.link && (
                            <a href={resource.link} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">
                              {resource.link}
                            </a>
                          )}
                          {resource.summary && <p className="text-sm text-gray-600 mt-1">{resource.summary}</p>}
                        </div>
                        <button
                          onClick={() => handleDeleteResource('survey', resource.id)}
                          className="text-gray-400 hover:text-red-500 ml-2"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {totalResources === 0 && (
                <p className="text-gray-500 text-center py-4">まだ登録された資料がありません</p>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Project Edit Form
  if (showProjectForm && editingProject) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              setShowProjectForm(false);
              setEditingProject(null);
            }}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <h3 className="text-xl font-bold">
            {projects.find(p => p.id === editingProject.id) ? 'プロジェクト編集' : '新規プロジェクト'}
          </h3>
        </div>

        <div className="card space-y-4">
          <div>
            <label className="block font-semibold mb-2">プロジェクト名</label>
            <input
              type="text"
              value={editingProject.name}
              onChange={(e) => setEditingProject({ ...editingProject, name: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
              placeholder="プロジェクト名を入力"
            />
          </div>

          <div className="border-t pt-4">
            <h4 className="font-semibold mb-3">探究活動の概要</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">テーマ</label>
                <input
                  type="text"
                  value={editingProject.theme}
                  onChange={(e) => setEditingProject({ ...editingProject, theme: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                  placeholder="探究テーマを入力"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">背景</label>
                <textarea
                  value={editingProject.background}
                  onChange={(e) => setEditingProject({ ...editingProject, background: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 min-h-[100px] resize-y"
                  placeholder="研究の背景を入力"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">仮説</label>
                <textarea
                  value={editingProject.hypothesis}
                  onChange={(e) => setEditingProject({ ...editingProject, hypothesis: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 min-h-[100px] resize-y"
                  placeholder="仮説を入力"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">最終発表資料URL</label>
                <input
                  type="url"
                  value={editingProject.presentationUrl}
                  onChange={(e) => setEditingProject({ ...editingProject, presentationUrl: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                  placeholder="https://..."
                />
              </div>
            </div>
          </div>

          {/* Team Members */}
          <div className="border-t pt-4">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Users size={18} />
              チームメンバー
            </h4>
            <div className="relative mb-3">
              <div
                onClick={() => setShowStudentDropdown(!showStudentDropdown)}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg cursor-pointer flex items-center justify-between hover:border-gray-300"
              >
                <span className="text-gray-500">生徒から選択...</span>
                <ChevronDown size={20} className="text-gray-400" />
              </div>

              {showStudentDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-white border-2 border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  <div className="p-2 border-b">
                    <input
                      type="text"
                      value={studentSearch}
                      onChange={(e) => setStudentSearch(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded focus:outline-none focus:border-blue-500"
                      placeholder="名前で検索..."
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                  {filteredStudents.length === 0 ? (
                    <div className="p-3 text-gray-500 text-center">
                      {students.length === 0 ? '生徒がいません' : '該当するメンバーがいません'}
                    </div>
                  ) : (
                    filteredStudents.map((student) => {
                      const isAdded = editingProject.teamMembers.some(m => m.id === student.id);
                      return (
                        <div
                          key={student.id}
                          onClick={() => !isAdded && handleAddTeamMember(student)}
                          className={`px-4 py-2 flex items-center justify-between ${
                            isAdded
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'hover:bg-blue-50 cursor-pointer'
                          }`}
                        >
                          <div>
                            <p className="font-medium">{student.name}</p>
                            <p className="text-xs text-gray-500">{student.email}{student.class_name && ` (${student.class_name})`}</p>
                          </div>
                          {isAdded && <Check size={16} className="text-green-500" />}
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {editingProject.teamMembers.map((member) => (
                <span
                  key={member.id}
                  className="px-3 py-1.5 bg-blue-100 text-blue-800 rounded-full text-sm font-medium flex items-center gap-2"
                >
                  {member.name}
                  <button
                    onClick={() => handleRemoveTeamMember(member.id)}
                    className="hover:text-blue-600"
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              onClick={() => {
                setShowProjectForm(false);
                setEditingProject(null);
              }}
              className="px-6 py-2.5 border-2 border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              キャンセル
            </button>
            <button
              onClick={handleSaveProject}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              保存
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main View - Project List
  return (
    <div className="space-y-6">
      {/* Project List Section */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="card-title mb-0">プロジェクト一覧</h3>
          <button
            onClick={handleCreateProject}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus size={18} />
            新規作成
          </button>
        </div>

        {projects.length === 0 ? (
          <div className="text-center py-8">
            <FolderOpen size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 mb-4">プロジェクトがありません</p>
            <button
              onClick={handleCreateProject}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              最初のプロジェクトを作成
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {projects.map((project) => {
              const totalResources = project.webResources.length +
                                    project.literatureResources.length +
                                    project.surveyResources.length;
              return (
                <div
                  key={project.id}
                  onClick={() => setSelectedProject(project)}
                  className="p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <FolderOpen size={24} className="text-blue-600" />
                    <div>
                      <h4 className="font-semibold text-gray-900">{project.name || '無題のプロジェクト'}</h4>
                      <div className="flex items-center gap-3 text-sm text-gray-500">
                        {project.theme && <span>{project.theme}</span>}
                        {project.teamMembers.length > 0 && (
                          <span className="flex items-center gap-1">
                            <Users size={14} />
                            {project.teamMembers.length}人
                          </span>
                        )}
                        {totalResources > 0 && (
                          <span className="flex items-center gap-1">
                            <FileText size={14} />
                            資料{totalResources}件
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <ChevronRight size={20} className="text-gray-400 group-hover:text-gray-600" />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
