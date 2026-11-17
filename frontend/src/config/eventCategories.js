/**
 * InsightLoop Universal Event Categories and Subcategories Registry
 * Used across Event Creation, Discovery, Filtering, and Dynamic Forms.
 */

export const EVENT_CATEGORIES = {
  Marathon: {
    id: 'Marathon',
    name: 'Marathons & Running',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    accentColor: '#10B981',
    description: 'Road races, marathons, trail runs, and athletic endurance events.',
    subcategories: [
      '5K Fun Run',
      '10K Challenge',
      'Half Marathon (21.1K)',
      'Full Marathon (42.2K)',
      'Ultra Marathon',
      'Trail & Mountain Run',
      'Corporate Relay Run',
      'Charity Walkathon',
    ],
  },
  Sports: {
    id: 'Sports',
    name: 'Sports & Tournaments',
    badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
    accentColor: '#F59E0B',
    description: 'Competitive matches, sports leagues, athletics, and collegiate tournaments.',
    subcategories: [
      'Cricket Championship',
      'Football Tournament',
      'Basketball League',
      'Badminton Open',
      'Tennis & Table Tennis',
      'Athletics & Track Meet',
      'Esports Championship',
      'Swimming Gala',
      'Volleyball Cup',
    ],
  },
  Concert: {
    id: 'Concert',
    name: 'Concerts & Music',
    badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
    accentColor: '#8B5CF6',
    description: 'Live musical shows, band performances, DJ nights, and multi-day music festivals.',
    subcategories: [
      'Live Band Concert',
      'EDM / DJ Night',
      'Classical & Fusion Recital',
      'College Fest Pro-Nite',
      'Acoustic Unplugged',
      'Multi-Stage Music Festival',
      'Battle of the Bands',
    ],
  },
  Conference: {
    id: 'Conference',
    name: 'Conferences & Seminars',
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
    accentColor: '#3B82F6',
    description: 'Industry summits, academic symposiums, research conferences, and executive panels.',
    subcategories: [
      'Technical & Engineering Summit',
      'Business & Entrepreneurship',
      'Academic & Research Symposium',
      'Healthcare & Medical Conference',
      'Policy, Law & Governance',
      'Fintech & Banking Forum',
      'Climate & Sustainability Summit',
    ],
  },
  Workshop: {
    id: 'Workshop',
    name: 'Workshops & Training',
    badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    accentColor: '#6366F1',
    description: 'Hands-on bootcamps, technical training, skill development, and masterclasses.',
    subcategories: [
      'Coding & Web Development',
      'AI, Machine Learning & Data Science',
      'Cybersecurity & Ethical Hacking',
      'UI/UX & Product Design',
      'Cloud Architecture & DevOps',
      'Leadership & Public Speaking',
      'Hardware & Robotics Lab',
    ],
  },
  Cultural: {
    id: 'Cultural',
    name: 'Cultural & Arts',
    badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
    accentColor: '#F43F5E',
    description: 'Drama, dance fests, fine arts, culinary festivals, and literature exhibitions.',
    subcategories: [
      'Drama & Theatre Production',
      'Classical & Folk Dance Fest',
      'Art & Photography Exhibition',
      'Literature & Poetry Meet',
      'Film Screening & Discussion',
      'Culinary & Food Festival',
      'Fashion & Heritage Show',
    ],
  },
  Corporate: {
    id: 'Corporate',
    name: 'Corporate & Business',
    badgeColor: 'bg-slate-100 text-slate-800 border-slate-300',
    accentColor: '#475569',
    description: 'Town halls, annual general meetings, product launches, offsites, and partner meets.',
    subcategories: [
      'Product Launch & Demo Day',
      'Annual General Meeting (AGM)',
      'Company Town Hall & All-Hands',
      'Team Offsite & Retreat',
      'Client & Partner Summit',
      'Leadership Strategy Offsite',
      'Investor Day',
    ],
  },
  Charity: {
    id: 'Charity',
    name: 'Charity & Fundraisers',
    badgeColor: 'bg-pink-50 text-pink-700 border-pink-200',
    accentColor: '#EC4899',
    description: 'Benefit galas, donation drives, charity runs, NGO meets, and awareness campaigns.',
    subcategories: [
      'Charity Gala Dinner',
      'Fundraiser Walkathon / Run',
      'Benefit Art Auction',
      'Donation Drive & NGO Fair',
      'Youth Awareness Campaign',
      'Disaster Relief Fundraiser',
    ],
  },
  Community: {
    id: 'Community',
    name: 'Community & Public',
    badgeColor: 'bg-teal-50 text-teal-700 border-teal-200',
    accentColor: '#14B8A6',
    description: 'Civic gatherings, street festivals, farmers markets, book fairs, and neighborhood fests.',
    subcategories: [
      'Street Festival & Carnival',
      'Farmers & Artisan Market',
      'Book Fair & Literature Fest',
      'Civic Town Hall & Public Hearing',
      'Neighborhood Gathering',
      'Eco & Green Earth Fair',
      'Open Mic & Talent Showcase',
    ],
  },
  College: {
    id: 'College',
    name: 'Colleges & Academic',
    badgeColor: 'bg-orange-50 text-orange-700 border-orange-200',
    accentColor: '#F97316',
    description: 'Hackathons, tech fests, inter-college competitions, orientations, and academic clubs.',
    subcategories: [
      'Hackathon & Coding Sprint',
      'Tech Fest & Project Expo',
      'Inter-College Cultural Fest',
      'Student Orientation & Induction',
      'Academic Seminar & Workshop',
      'College Annual Sports Meet',
      'Alumni Homecoming & Reunion',
    ],
  },
};

export const CATEGORY_KEYS = Object.keys(EVENT_CATEGORIES);

export function getCategoryBadge(category) {
  if (!category) return { name: 'General', badgeColor: 'bg-gray-100 text-gray-700 border-gray-200' };

  const norm = category.trim().toLowerCase();
  for (const [key, val] of Object.entries(EVENT_CATEGORIES)) {
    if (key.toLowerCase() === norm || val.name.toLowerCase() === norm || norm.includes(key.toLowerCase())) {
      return val;
    }
  }
  return {
    id: category,
    name: category,
    badgeColor: 'bg-gray-100 text-gray-700 border-gray-200',
    accentColor: '#6B7280',
    subcategories: [],
  };
}
