// frontend/src/api/contentApi.js
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';

// Helper to get full image URL from backend
export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  // If it's already a full URL, return it
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  // Remove 'uploads/' prefix if present to avoid duplication
  const cleanPath = imagePath.replace(/^uploads\//, '');
  // Use the backend URL for images
  const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000';
  return `${baseUrl}/uploads/${cleanPath}`;
};

// Generic fetch function with error handling
const fetchContent = async (endpoint, defaultValue) => {
  try {
    const response = await fetch(`${API_URL}/content/${endpoint}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${endpoint} content`);
    }
    const result = await response.json();
    
    // Handle different response structures
    if (result.data) {
      // If data is a string (JSON), parse it
      if (typeof result.data === 'string') {
        return JSON.parse(result.data);
      }
      return result.data;
    }
    return result;
  } catch (error) {
    console.error(`Error fetching ${endpoint} content:`, error);
    return defaultValue;
  }
};

// Hero Content
export const fetchHeroContent = async () => {
  const defaultHero = {
    badge: '2026 Award Winner',
    title: 'Built with <span>precision</span> & integrity',
    description: 'From concept to completion — we deliver commercial, residential, and industrial projects that stand the test of time.',
    stats: [
      { number: '120+', label: 'Projects Completed' },
      { number: '98%', label: 'Client Satisfaction' },
      { number: '15+', label: 'Years Experience' }
    ],
    image_1: 'home.jpg',     // Main hero background image
    image_1_alt: 'Hero banner',
    image_2: null,           // Optional secondary image
    image_2_alt: null
  };
  
  const data = await fetchContent('hero', defaultHero);
  
  // Handle image fields from backend (image_1, image_2)
  if (data.image_1) {
    data.hero_image_url = getImageUrl(data.image_1);
  } else {
    data.hero_image_url = getImageUrl('home.jpg'); // Fallback
  }
  
  if (data.image_2) {
    data.hero_image_2_url = getImageUrl(data.image_2);
  }
  
  return data;
};

// About Content
export const fetchAboutContent = async () => {
  const defaultAbout = {
    tag: 'About Us',
    title: 'Building Excellence <span>Since 2010</span>',
    description: 'BuildPort is a full-service construction company dedicated to delivering superior quality, innovation, and reliability.',
    features: [
      { title: 'Quality Assurance', description: 'Rigorous quality control at every stage' },
      { title: 'On-Time Delivery', description: 'Projects completed within schedule' },
      { title: 'Sustainable Building', description: 'Eco-friendly materials and practices' }
    ],
    image_1: 'about-1.jpg',      // Main image
    image_1_alt: 'About us main image',
    image_2: 'about-2.jpg',      // Secondary overlay image
    image_2_alt: 'About us secondary image'
  };
  
  const data = await fetchContent('about', defaultAbout);
  
  // Handle both image fields
  if (data.image_1) {
    data.main_image_url = getImageUrl(data.image_1);
  } else {
    data.main_image_url = getImageUrl('about-1.jpg'); // Fallback
  }
  
  if (data.image_2) {
    data.overlay_image_url = getImageUrl(data.image_2);
  } else {
    data.overlay_image_url = getImageUrl('about-2.jpg'); // Fallback
  }
  
  return data;
};

// Services Content
export const fetchServices = async () => {
  const defaultServices = [
    { 
      id: 1,
      icon: 'fa-hard-hat', 
      title: 'General Contracting', 
      description: 'Full-service construction management from ground-up to completion.',
      image: null
    },
    { 
      id: 2,
      icon: 'fa-pencil-ruler', 
      title: 'Design & Build', 
      description: 'Integrated design and construction services for seamless delivery.',
      image: null
    },
    { 
      id: 3,
      icon: 'fa-house-chimney', 
      title: 'Residential Construction', 
      description: 'Custom homes, renovations, and residential development projects.',
      image: null
    },
    { 
      id: 4,
      icon: 'fa-city', 
      title: 'Commercial Building', 
      description: 'Office spaces, retail centers, and commercial facilities.',
      image: null
    },
    { 
      id: 5,
      icon: 'fa-industry', 
      title: 'Industrial Projects', 
      description: 'Warehouses, manufacturing plants, and industrial facilities.',
      image: null
    },
    { 
      id: 6,
      icon: 'fa-helmet-safety', 
      title: 'Renovation & Restoration', 
      description: 'Historic restoration, remodeling, and property renovation.',
      image: null
    }
  ];
  
  try {
    const response = await fetch(`${API_URL}/services`);
    if (!response.ok) throw new Error('Failed to fetch services');
    const result = await response.json();
    const services = result.data || result || [];
    
    // Process services to add image URLs
    return services.map(service => ({
      ...service,
      image_url: service.image ? getImageUrl(service.image) : null
    }));
  } catch (error) {
    console.error('Error fetching services:', error);
    return defaultServices;
  }
};

// Projects Content
export const fetchProjects = async (filters = {}) => {
  const defaultProjects = [
    { 
      id: 1,
      title: 'Riverside Tower', 
      location: 'Austin, TX', 
      category: 'Commercial', 
      tags: ['High-rise', 'LEED Certified'],
      image: 'pr1.jpg'
    },
    { 
      id: 2,
      title: 'Willow Creek Estate', 
      location: 'Napa Valley, CA', 
      category: 'Residential', 
      tags: ['Luxury', 'Eco-Friendly'],
      image: 'pr2.jpg'
    },
    { 
      id: 3,
      title: 'Harbor Industrial Hub', 
      location: 'Savannah, GA', 
      category: 'Industrial', 
      tags: ['Warehouse', 'Logistics'],
      image: 'pr3.jpg'
    },
    { 
      id: 4,
      title: 'Parkview Medical Pavilion', 
      location: 'Denver, CO', 
      category: 'Healthcare', 
      tags: ['Institutional', 'Modern'],
      image: 'pr4.jpg'
    }
  ];
  
  try {
    // Build query string for filters
    const params = new URLSearchParams();
    if (filters.category) params.append('category', filters.category);
    if (filters.featured !== undefined) params.append('featured', filters.featured);
    if (filters.limit) params.append('limit', filters.limit);
    if (filters.page) params.append('page', filters.page);
    
    const url = `${API_URL}/projects${params.toString() ? '?' + params.toString() : ''}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch projects');
    const result = await response.json();
    
    // Handle nested data structure from backend
    const projects = result.data?.data || result.data || result || [];
    
    return projects.map(project => ({
      ...project,
      image_url: project.image ? getImageUrl(project.image) : null
    }));
  } catch (error) {
    console.error('Error fetching projects:', error);
    return defaultProjects;
  }
};

// Team Content
export const fetchTeam = async () => {
  const defaultTeam = [
    { 
      id: 1,
      name: 'David Martinez', 
      role: 'CEO & Founder', 
      experience: '25+ years',
      avatar: null,
      social_linkedin: '#',
      social_twitter: '#',
      social_github: '#'
    },
    { 
      id: 2,
      name: 'Sarah Johnson', 
      role: 'Project Director', 
      experience: '18 years',
      avatar: null,
      social_linkedin: '#',
      social_twitter: '#',
      social_github: '#'
    },
    { 
      id: 3,
      name: 'Michael Chen', 
      role: 'Lead Architect', 
      experience: '15 years',
      avatar: null,
      social_linkedin: '#',
      social_twitter: '#',
      social_github: '#'
    },
    { 
      id: 4,
      name: 'Emily Rodriguez', 
      role: 'Construction Manager', 
      experience: '12 years',
      avatar: null,
      social_linkedin: '#',
      social_twitter: '#',
      social_github: '#'
    }
  ];
  
  try {
    const response = await fetch(`${API_URL}/team`);
    if (!response.ok) throw new Error('Failed to fetch team');
    const result = await response.json();
    const team = result.data || result || [];
    
    return team.map(member => ({
      ...member,
      // Map social fields to consistent structure
      social: {
        linkedin: member.social_linkedin || '#',
        twitter: member.social_twitter || '#',
        github: member.social_github || '#'
      },
      avatar_url: member.avatar ? getImageUrl(member.avatar) : null
    }));
  } catch (error) {
    console.error('Error fetching team:', error);
    return defaultTeam;
  }
};

// Pages Content (Static pages info)
export const fetchPages = async () => {
  return [
    {
      id: 1,
      title: 'Project Gallery',
      description: 'View our complete portfolio of construction projects',
      icon: 'fa-images',
      link: '/gallery'
    },
    {
      id: 2,
      title: 'Blog & Insights',
      description: 'Industry news, tips, and construction insights',
      icon: 'fa-newspaper',
      link: '/blog'
    },
    {
      id: 3,
      title: 'Careers',
      description: 'Join our team of construction professionals',
      icon: 'fa-briefcase',
      link: '/careers'
    },
    {
      id: 4,
      title: 'Resources',
      description: 'Guides, tools, and resources for your projects',
      icon: 'fa-book-open',
      link: '/resources'
    }
  ];
};

// Contact Content (from backend or static)
export const fetchContactContent = async () => {
  const defaultContact = {
    email: 'info@buildport.com',
    phone: '+1 (555) 123-4567',
    address: '123 Construction Ave, Suite 200',
    map_url: null
  };
  
  try {
    const response = await fetch(`${API_URL}/content/contact`);
    if (!response.ok) throw new Error('Failed to fetch contact content');
    const result = await response.json();
    return result.data || defaultContact;
  } catch (error) {
    console.error('Error fetching contact content:', error);
    return defaultContact;
  }
};