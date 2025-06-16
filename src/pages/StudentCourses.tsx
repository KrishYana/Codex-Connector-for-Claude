import React, { useState, useEffect } from 'react';
import { Clock, Users, BookOpen, Play } from 'lucide-react';
import { useToastActions } from '../hooks/useToastActions';
import { SkeletonCard } from '../components/skeletons';

const courses = [
  {
    id: 1,
    title: 'React Fundamentals',
    instructor: 'Dr. Jane Smith',
    progress: 75,
    duration: '8 weeks',
    students: 156,
    image: 'https://images.pexels.com/photos/574071/pexels-photo-574071.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  {
    id: 2,
    title: 'JavaScript Advanced',
    instructor: 'Prof. John Doe',
    progress: 45,
    duration: '12 weeks', 
    students: 89,
    image: 'https://images.pexels.com/photos/270348/pexels-photo-270348.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  {
    id: 3,
    title: 'Web Design Basics',
    instructor: 'Dr. Sarah Wilson',
    progress: 90,
    duration: '6 weeks',
    students: 234,
    image: 'https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  {
    id: 4,
    title: 'Database Systems',
    instructor: 'Prof. Mike Johnson',
    progress: 30,
    duration: '10 weeks',
    students: 67,
    image: 'https://images.pexels.com/photos/577585/pexels-photo-577585.jpeg?auto=compress&cs=tinysrgb&w=400'
  }
];

export const StudentCourses: React.FC = () => {
  const { showAssignmentSubmitted, showQuizSubmitted } = useToastActions();
  const [isLoading, setIsLoading] = useState(true);

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleContinueLearning = (courseTitle: string) => {
    // Simulate different types of submissions
    const actions = [
      () => showAssignmentSubmitted(`${courseTitle} - Final Project`),
      () => showQuizSubmitted(`${courseTitle} - Chapter 5 Quiz`),
    ];
    
    const randomAction = actions[Math.floor(Math.random() * actions.length)];
    setTimeout(randomAction, 1000);
  };

  if (isLoading) {
    return (
      <div className="space-y-space-6">
        <div>
          <div className="h-8 bg-neutral-200 rounded-radius-md animate-pulse w-1/3 mb-space-2" />
          <div className="h-4 bg-neutral-200 rounded-radius-md animate-pulse w-1/2" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-space-6" data-skeleton-context="grid">
          {Array.from({ length: 4 }).map((_, index) => (
            <SkeletonCard 
              key={index}
              showImage={true}
              showMetadata={true}
              showProgress={true}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-space-6">
      <div>
        <h1 className="heading-1">My Courses</h1>
        <p className="body-text">Continue learning and track your progress</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-space-6">
        {courses.map((course) => (
          <div key={course.id} className="card overflow-hidden hover:shadow-md transition-shadow">
            <div className="relative h-48">
              <img 
                src={course.image} 
                alt={course.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-space-4 right-space-4">
                <button className="bg-neutral-0 bg-opacity-90 hover:bg-opacity-100 p-space-2 rounded-full transition-all">
                  <Play className="w-4 h-4 text-primary-600" />
                </button>
              </div>
            </div>
            
            <div className="card-body">
              <h3 className="heading-3">{course.title}</h3>
              <p className="body-text mb-space-4">{course.instructor}</p>
              
              <div className="flex items-center justify-between caption-text mb-space-4">
                <div className="flex items-center space-x-space-1">
                  <Clock className="w-4 h-4" />
                  <span>{course.duration}</span>
                </div>
                <div className="flex items-center space-x-space-1">
                  <Users className="w-4 h-4" />
                  <span>{course.students} students</span>
                </div>
              </div>
              
              <div className="mb-space-4">
                <div className="flex justify-between text-scale-sm mb-space-2">
                  <span className="body-text">Progress</span>
                  <span className="font-weight-medium text-neutral-900">{course.progress}%</span>
                </div>
                <div className="w-full bg-neutral-200 rounded-full h-2">
                  <div 
                    className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${course.progress}%` }}
                  ></div>
                </div>
              </div>
              
              <button 
                onClick={() => handleContinueLearning(course.title)}
                className="btn-primary w-full flex items-center justify-center space-x-space-2"
              >
                <BookOpen className="w-4 h-4" />
                <span>Continue Learning</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};