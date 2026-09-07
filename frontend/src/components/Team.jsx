// frontend/src/components/Team.jsx
import React, { useEffect, useState } from 'react';
import { fetchTeam } from '../api/contentApi';

const Team = () => {
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTeam = async () => {
      try {
        const data = await fetchTeam();
        setTeam(data);
      } catch (error) {
        console.error('Error loading team:', error);
      } finally {
        setLoading(false);
      }
    };
    loadTeam();
  }, []);

  if (loading) {
    return <div className="team-loading">Loading team...</div>;
  }

  return (
    <section className="team">
      <h2 className="section-title">
        Our <span>Team</span>
      </h2>
      <p className="section-subtitle">
        Meet the experts behind our award-winning projects
      </p>
      <div className="team-grid">
        {team.map((member) => (
          <div key={member.id || member.name} className="team-card">
            <div className="team-avatar">
              {member.avatar_url ? (
                <img 
                  src={member.avatar_url} 
                  alt={member.name}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.parentElement.innerHTML = '<i class="fas fa-user-circle"></i>';
                  }}
                />
              ) : (
                <i className="fas fa-user-circle"></i>
              )}
            </div>
            <h3>{member.name}</h3>
            <p className="team-role">{member.role}</p>
            <p className="team-experience">
              <i className="fas fa-briefcase"></i> {member.experience}
            </p>
            <div className="team-social">
              <a href={member.social?.linkedin || '#'} className="social-link" target="_blank" rel="noopener noreferrer">
                <i className="fab fa-linkedin-in"></i>
              </a>
              <a href={member.social?.twitter || '#'} className="social-link" target="_blank" rel="noopener noreferrer">
                <i className="fab fa-twitter"></i>
              </a>
              <a href={member.social?.github || '#'} className="social-link" target="_blank" rel="noopener noreferrer">
                <i className="fab fa-github"></i>
              </a>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Team;