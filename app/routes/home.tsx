import Navbar from '~/component/Navbar';
import ResumeCard from '~/component/ResumeCard';
import { usePuterStore } from '~/lib/puter';
import { useNavigate, Link } from 'react-router';
import { useEffect, useState } from 'react';

export default function Home() {
  const { auth, kv, isLoading } = usePuterStore();
  const navigate = useNavigate();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loadingResumes, setLoadingResumes] = useState(true);

  // ✅ FIX 1: guard auth redirect
  useEffect(() => {
    if (!isLoading && auth.isAuthenticated === false) {
      navigate('/auth?next=/');
    }
  }, [auth.isAuthenticated, isLoading, navigate]);

  // ✅ FIX 2: add dependency array
  useEffect(() => {
    const loadResumes = async () => {
      try {
        const items = (await kv.list('resume:*', true)) as KVItem[];
        const parsed = items?.map((item) => JSON.parse(item.value) as Resume);
        setResumes(parsed || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingResumes(false);
      }
    };

    loadResumes();
  }, [kv]);

  if (isLoading || !auth.isAuthenticated) return null;

  return (
    <main className="bg-[url('/images/bg-main.svg')] bg-cover min-h-screen">
      <Navbar />

      <section className="main-section">
        <div className="page-heading py-16">
          <h1>Track your Applications and Resume readings</h1>

          {!loadingResumes && resumes.length === 0 ? (
            <h2>No resumes found. Upload your first resume to get feedback.</h2>
          ) : (
            <h2>Review your submissions and check AI-powered feedback.</h2>
          )}
        </div>

        {loadingResumes && (
          <div className="flex justify-center">
            <img src="/resume-scan-2.gif" className="w-[200px]" />
          </div>
        )}

        {/* ✅ ResumeCard preserved exactly */}
        {!loadingResumes && resumes.length > 0 && (
          <div className="resumes-section">
            {resumes.map((resume) => (
              <ResumeCard key={resume.id} resume={resume} />
            ))}
          </div>
        )}

        {/* ✅ FIX 3: valid JSX */}
        {!loadingResumes && resumes.length === 0 && (
          <div className="flex justify-center py-10">
            <Link
              to="/upload"
              className="primary-button w-fit text-xl font-semibold"
            >
              Upload Resume
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}
