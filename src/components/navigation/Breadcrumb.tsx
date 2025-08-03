import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BreadcrumbItem {
  label: string;
  path: string;
  icon?: React.ComponentType<any>;
}

interface BreadcrumbProps {
  className?: string;
}

const getBreadcrumbs = (pathname: string): BreadcrumbItem[] => {
  const segments = pathname.split('/').filter(Boolean);
  const breadcrumbs: BreadcrumbItem[] = [];
  
  if (segments.length === 0) return breadcrumbs;
  
  const userType = segments[0]; // farmer, dealer, admin
  
  // Add home/dashboard
  if (userType === 'farmer') {
    breadcrumbs.push({
      label: 'Dashboard',
      path: '/farmer/dashboard',
      icon: Home
    });
  } else if (userType === 'dealer') {
    breadcrumbs.push({
      label: 'Dashboard', 
      path: '/dealer/dashboard',
      icon: Home
    });
  } else if (userType === 'admin') {
    breadcrumbs.push({
      label: 'Admin Panel',
      path: '/admin',
      icon: Home
    });
  }
  
  // Add subsequent pages
  for (let i = 1; i < segments.length; i++) {
    const segment = segments[i];
    const path = `/${segments.slice(0, i + 1).join('/')}`;
    
    // Skip dashboard segment to avoid duplicates with the initial dashboard breadcrumb
    if (segment === 'dashboard') {
      continue;
    }
    
    let label = segment;
    
    // Convert segment names to proper labels
    switch (segment) {
      case 'feed-prices':
        label = userType === 'farmer' ? 'Feed Prices & Dealers' : 'Feed Prices';
        break;
      case 'fcr-calculator':
        label = 'FCR Calculator';
        break;
      case 'vaccines':
        label = 'Vaccine Reminders';
        break;
      case 'calculators':
        label = 'Poultry Calculators';
        break;
      case 'shed-management':
        label = 'Shed Management';
        break;
      case 'orders':
        label = userType === 'farmer' ? 'My Orders' : 'Order Management';
        break;
      case 'posts':
        label = 'Posts & Guides';
        break;
      case 'inventory':
        label = 'Inventory Management';
        break;
      case 'settings':
        label = 'Settings';
        break;
      case 'rates':
        label = 'Broiler Rates';
        break;
      case 'users':
        label = 'User Management';
        break;
      case 'reports':
        label = 'Reports';
        break;
      default:
        label = segment.charAt(0).toUpperCase() + segment.slice(1).replace('-', ' ');
    }
    
    breadcrumbs.push({
      label,
      path
    });
  }
  
  return breadcrumbs;
};

export function Breadcrumb({ className = '' }: BreadcrumbProps) {
  const location = useLocation();
  const breadcrumbs = getBreadcrumbs(location.pathname);
  
  if (breadcrumbs.length <= 1) return null;
  
  return (
    <nav className={`flex items-center space-x-1 text-sm text-gray-600 ${className}`}>
      {breadcrumbs.map((crumb, index) => (
        <React.Fragment key={`breadcrumb-${index}-${crumb.path}`}>
          {index === breadcrumbs.length - 1 ? (
            // Current page - not clickable
            <span className="flex items-center text-gray-900 font-medium">
              {crumb.icon && <crumb.icon className="w-4 h-4 mr-1" />}
              {crumb.label}
            </span>
          ) : (
            // Clickable breadcrumb
            <Link
              to={crumb.path}
              className="flex items-center hover:text-gray-900 transition-colors"
            >
              {crumb.icon && <crumb.icon className="w-4 h-4 mr-1" />}
              {crumb.label}
            </Link>
          )}
          
          {index < breadcrumbs.length - 1 && (
            <ChevronRight className="w-4 h-4 text-gray-400" />
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}

export default Breadcrumb;
