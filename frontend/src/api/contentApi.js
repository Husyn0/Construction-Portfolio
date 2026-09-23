// frontend/src/api/contentApi.js

// Backend base URL for images (NO /api/v1 prefix)
const IMAGE_BASE_URL = (process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1')
  .replace(/\/api\/v1\/?$/, '');

// API base URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';

// Helper to get full image URL from backend
export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  // If it's already a full URL, return it
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  // Remove leading slashes and 'uploads/' prefix if present to avoid duplication
  const cleanPath = imagePath
    .replace(/^\/+/, '')
    .replace(/^uploads\//, '');
  return `${IMAGE_BASE_URL}/uploads/${cleanPath}`;
};

// Generic fetch function with error handling
const fetchContent = async (endpoint, defaultValue) => {
  try {
    const response = await fetch(`${API_URL}/content/${endpoint}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${endpoint} content`);
    }
    const result = await response.json();
    // Backend returns the content object at the top level.
    // It may or may not have a `data` field (JSON string OR object).
    // We keep image_* fields as siblings.
    const content = result.data !== undefined ? result.data : result;

    // If content is a JSON string (backend stores data as JSON column), parse it
    const parsed = typeof content === 'string' ? JSON.parse(content) : content;

    // Merge top-level image fields (image_1, image_2, *_alt) back into the content object
    return {
      ...parsed,
      image_1: result.image_1 ?? parsed?.image_1 ?? null,
      image_1_alt: result.image_1_alt ?? parsed?.image_1_alt ?? null,
      image_2: result.image_2 ?? parsed?.image_2 ?? null,
      image_2_alt: result.image_2_alt ?? parsed?.image_2_alt ?? null,
    };
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
    image_1: 'home.jpg',
    image_1_alt: 'Hero banner',
    image_2: null,
    image_2_alt: null
  };

  const data = await fetchContent('hero', defaultHero);

  data.hero_image_url = data.image_1
    ? getImageUrl(data.image_1)
    : getImageUrl('home.jpg');

  data.hero_image_2_url = data.image_2 ? getImageUrl(data.image_2) : null;

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
    image_1: 'about-1.jpg',
    image_1_alt: 'About us main image',
    image_2: 'about-2.jpg',
    image_2_alt: 'About us secondary image'
  };

  const data = await fetchContent('about', defaultAbout);

  data.main_image_url = data.image_1
    ? getImageUrl(data.image_1)
    : getImageUrl('about-1.jpg');

  data.overlay_image_url = data.image_2
    ? getImageUrl(data.image_2)
    : getImageUrl('about-2.jpg');

  return data;
};

// Services Content
export const fetchServices = async () => {
  const defaultServices = [
    { id: 1, icon: 'fa-hard-hat', title: 'General Contracting', description: 'Full-service construction management from ground-up to completion.', image: null },
    { id: 2, icon: 'fa-pencil-ruler', title: 'Design & Build', description: 'Integrated design and construction services for seamless delivery.', image: null },
    { id: 3, icon: 'fa-house-chimney', title: 'Residential Construction', description: 'Custom homes, renovations, and residential development projects.', image: null },
    { id: 4, icon: 'fa-city', title: 'Commercial Building', description: 'Office spaces, retail centers, and commercial facilities.', image: null },
    { id: 5, icon: 'fa-industry', title: 'Industrial Projects', description: 'Warehouses, manufacturing plants, and industrial facilities.', image: null },
    { id: 6, icon: 'fa-helmet-safety', title: 'Renovation & Restoration', description: 'Historic restoration, remodeling, and property renovation.', image: null }
  ];

  try {
    const response = await fetch(`${API_URL}/services`);
    if (!response.ok) throw new Error('Failed to fetch services');
    const result = await response.json();
    const services = result.data?.data || result.data || result || [];

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
    { id: 1, title: 'Riverside Tower', location: 'Austin, TX', category: 'Commercial', tags: ['High-rise', 'LEED Certified'], image: 'pr1.jpg' },
    { id: 2, title: 'Willow Creek Estate', location: 'Napa Valley, CA', category: 'Residential', tags: ['Luxury', 'Eco-Friendly'], image: 'pr2.jpg' },
    { id: 3, title: 'Harbor Industrial Hub', location: 'Savannah, GA', category: 'Industrial', tags: ['Warehouse', 'Logistics'], image: 'pr3.jpg' },
    { id: 4, title: 'Parkview Medical Pavilion', location: 'Denver, CO', category: 'Healthcare', tags: ['Institutional', 'Modern'], image: 'pr4.jpg' }
  ];

  try {
    const params = new URLSearchParams();
    if (filters.category) params.append('category', filters.category);
    if (filters.featured !== undefined) params.append('featured', filters.featured);
    if (filters.limit) params.append('limit', filters.limit);
    if (filters.page) params.append('page', filters.page);

    const url = `${API_URL}/projects${params.toString() ? '?' + params.toString() : ''}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch projects');
    const result = await response.json();
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
    { id: 1, name: 'David Martinez', role: 'CEO & Founder', experience: '25+ years', avatar: null, social_linkedin: '#', social_twitter: '#', social_github: '#' },
    { id: 2, name: 'Sarah Johnson', role: 'Project Director', experience: '18 years', avatar: null, social_linkedin: '#', social_twitter: '#', social_github: '#' },
    { id: 3, name: 'Michael Chen', role: 'Lead Architect', experience: '15 years', avatar: null, social_linkedin: '#', social_twitter: '#', social_github: '#' },
    { id: 4, name: 'Emily Rodriguez', role: 'Construction Manager', experience: '12 years', avatar: null, social_linkedin: '#', social_twitter: '#', social_github: '#' }
  ];

  try {
    const response = await fetch(`${API_URL}/team`);
    if (!response.ok) throw new Error('Failed to fetch team');
    const result = await response.json();
    const team = result.data?.data || result.data || result || [];

    return team.map(member => ({
      ...member,
      social: {
        linkedin: member.social_linkedin || member.social?.linkedin || '#',
        twitter: member.social_twitter || member.social?.twitter || '#',
        github: member.social_github || member.social?.github || '#'
      },
      avatar_url: member.avatar ? getImageUrl(member.avatar) : null
    }));
  } catch (error) {
    console.error('Error fetching team:', error);
    return defaultTeam;
  }
};

// Pages Content (Static)
export const fetchPages = async () => {
  return [
    { id: 1, title: 'Project Gallery', description: 'View our complete portfolio of construction projects', icon: 'fa-images', link: '/gallery' },
    { id: 2, title: 'Blog & Insights', description: 'Industry news, tips, and construction insights', icon: 'fa-newspaper', link: '/blog' },
    { id: 3, title: 'Careers', description: 'Join our team of construction professionals', icon: 'fa-briefcase', link: '/careers' },
    { id: 4, title: 'Resources', description: 'Guides, tools, and resources for your projects', icon: 'fa-book-open', link: '/resources' }
  ];
};

// Contact Content
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