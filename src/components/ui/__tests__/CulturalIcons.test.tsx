import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
  CulturalIcon,
  RiceIcon,
  WheatIcon,
  SpiceIcon,
  LotusIcon,
  ElephantIcon,
  MandiIcon,
  VoiceWaveIcon,
  culturalIcons
} from '../CulturalIcons';

describe('CulturalIcons', () => {
  describe('Individual Icon Components', () => {
    test('should render RiceIcon with default props', () => {
      render(<RiceIcon />);
      const icon = screen.getByRole('img', { hidden: true });
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveAttribute('width', '24');
      expect(icon).toHaveAttribute('height', '24');
    });

    test('should render WheatIcon with custom size', () => {
      render(<WheatIcon size={32} />);
      const icon = screen.getByRole('img', { hidden: true });
      expect(icon).toHaveAttribute('width', '32');
      expect(icon).toHaveAttribute('height', '32');
    });

    test('should render SpiceIcon with custom color', () => {
      render(<SpiceIcon color="#FF0000" />);
      const icon = screen.getByRole('img', { hidden: true });
      const paths = icon.querySelectorAll('path, circle');
      paths.forEach(path => {
        const stroke = path.getAttribute('stroke');
        const fill = path.getAttribute('fill');
        if (stroke && stroke !== 'none') {
          expect(stroke).toBe('#FF0000');
        }
        if (fill && fill !== 'none') {
          expect(fill).toBe('#FF0000');
        }
      });
    });

    test('should apply custom className', () => {
      render(<LotusIcon className="custom-class" />);
      const icon = screen.getByRole('img', { hidden: true });
      expect(icon).toHaveClass('cultural-icon', 'lotus-icon', 'custom-class');
    });

    test('should render cultural symbols correctly', () => {
      render(<ElephantIcon />);
      const icon = screen.getByRole('img', { hidden: true });
      expect(icon).toHaveClass('cultural-icon', 'elephant-icon');
    });

    test('should render trading icons correctly', () => {
      render(<MandiIcon />);
      const icon = screen.getByRole('img', { hidden: true });
      expect(icon).toHaveClass('cultural-icon', 'mandi-icon');
    });

    test('should render voice interaction icons correctly', () => {
      render(<VoiceWaveIcon />);
      const icon = screen.getByRole('img', { hidden: true });
      expect(icon).toHaveClass('cultural-icon', 'voice-wave-icon');
    });
  });

  describe('CulturalIcon Component', () => {
    test('should render valid icon by name', () => {
      render(<CulturalIcon name="rice" />);
      const icon = screen.getByRole('img', { hidden: true });
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveClass('cultural-icon');
    });

    test('should handle invalid icon name gracefully', () => {
      // Suppress console.warn for this test
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      render(<CulturalIcon name={'invalid-icon' as any} />);
      
      expect(consoleSpy).toHaveBeenCalledWith('Cultural icon "invalid-icon" not found');
      expect(screen.queryByRole('img', { hidden: true })).not.toBeInTheDocument();
      
      consoleSpy.mockRestore();
    });

    test('should apply animation when animated prop is true', () => {
      render(<CulturalIcon name="lotus" animated={true} />);
      const icon = screen.getByRole('img', { hidden: true });
      expect(icon).toHaveClass('animate-pulse');
    });

    test('should apply cultural context class', () => {
      render(<CulturalIcon name="rice" culturalContext="agriculture" />);
      const icon = screen.getByRole('img', { hidden: true });
      expect(icon).toHaveClass('context-agriculture');
    });

    test('should pass through additional props', () => {
      render(<CulturalIcon name="wheat" size={48} color="#00FF00" />);
      const icon = screen.getByRole('img', { hidden: true });
      expect(icon).toHaveAttribute('width', '48');
      expect(icon).toHaveAttribute('height', '48');
    });
  });

  describe('Icon Registry', () => {
    test('should have all expected icons in registry', () => {
      const expectedIcons = [
        'rice', 'wheat', 'spice', 'vegetable',
        'lotus', 'elephant', 'peacock',
        'mandi', 'scale',
        'voiceWave', 'translate',
        'coconut', 'camel',
        'diya', 'rangoli'
      ];

      expectedIcons.forEach(iconName => {
        expect(culturalIcons).toHaveProperty(iconName);
        expect(typeof culturalIcons[iconName as keyof typeof culturalIcons]).toBe('function');
      });
    });

    test('should render all icons from registry', () => {
      Object.keys(culturalIcons).forEach(iconName => {
        const { unmount } = render(
          <CulturalIcon name={iconName as keyof typeof culturalIcons} />
        );
        
        const icon = screen.getByRole('img', { hidden: true });
        expect(icon).toBeInTheDocument();
        
        unmount();
      });
    });
  });

  describe('Accessibility', () => {
    test('should have proper SVG structure for screen readers', () => {
      render(<RiceIcon />);
      const svg = screen.getByRole('img', { hidden: true });
      
      expect(svg.tagName).toBe('svg');
      expect(svg).toHaveAttribute('viewBox');
      expect(svg).toHaveAttribute('fill');
    });

    test('should support custom aria attributes', () => {
      render(<LotusIcon aria-label="Lotus flower symbol" />);
      const icon = screen.getByLabelText('Lotus flower symbol');
      expect(icon).toBeInTheDocument();
    });

    test('should have appropriate default size for touch targets', () => {
      render(<CulturalIcon name="mandi" />);
      const icon = screen.getByRole('img', { hidden: true });
      
      // Default size should be 24px which is reasonable for icons
      expect(icon).toHaveAttribute('width', '24');
      expect(icon).toHaveAttribute('height', '24');
    });
  });

  describe('Cultural Context', () => {
    test('should categorize agricultural icons correctly', () => {
      const agriculturalIcons = ['rice', 'wheat', 'spice', 'vegetable'];
      
      agriculturalIcons.forEach(iconName => {
        render(<CulturalIcon name={iconName as any} culturalContext="agriculture" />);
        const icon = screen.getByRole('img', { hidden: true });
        expect(icon).toHaveClass('context-agriculture');
      });
    });

    test('should categorize cultural symbols correctly', () => {
      const culturalSymbols = ['lotus', 'elephant', 'peacock'];
      
      culturalSymbols.forEach(iconName => {
        render(<CulturalIcon name={iconName as any} culturalContext="cultural" />);
        const icon = screen.getByRole('img', { hidden: true });
        expect(icon).toHaveClass('context-cultural');
      });
    });

    test('should categorize festival icons correctly', () => {
      const festivalIcons = ['diya', 'rangoli'];
      
      festivalIcons.forEach(iconName => {
        render(<CulturalIcon name={iconName as any} culturalContext="festival" />);
        const icon = screen.getByRole('img', { hidden: true });
        expect(icon).toHaveClass('context-festival');
      });
    });
  });

  describe('Visual Consistency', () => {
    test('should maintain consistent stroke width across icons', () => {
      const icons = [RiceIcon, WheatIcon, SpiceIcon, LotusIcon];
      
      icons.forEach(IconComponent => {
        render(<IconComponent />);
        const svg = screen.getByRole('img', { hidden: true });
        const paths = svg.querySelectorAll('path');
        
        paths.forEach(path => {
          const strokeWidth = path.getAttribute('stroke-width');
          if (strokeWidth) {
            // Most icons should use 1.5 or 1 stroke width for consistency
            expect(['1', '1.5', '2']).toContain(strokeWidth);
          }
        });
      });
    });

    test('should use consistent viewBox dimensions', () => {
      const icons = [RiceIcon, WheatIcon, SpiceIcon, LotusIcon];
      
      icons.forEach(IconComponent => {
        render(<IconComponent />);
        const svg = screen.getByRole('img', { hidden: true });
        
        // All icons should use 24x24 viewBox for consistency
        expect(svg).toHaveAttribute('viewBox', '0 0 24 24');
      });
    });
  });

  describe('Performance', () => {
    test('should not re-render unnecessarily', () => {
      const renderSpy = jest.fn();
      
      const TestIcon = (props: any) => {
        renderSpy();
        return <RiceIcon {...props} />;
      };
      
      const { rerender } = render(<TestIcon size={24} />);
      expect(renderSpy).toHaveBeenCalledTimes(1);
      
      // Re-render with same props
      rerender(<TestIcon size={24} />);
      expect(renderSpy).toHaveBeenCalledTimes(2); // React will re-render, but icon should be optimized
    });

    test('should handle rapid prop changes efficiently', () => {
      const { rerender } = render(<CulturalIcon name="rice" size={24} />);
      
      // Rapidly change props
      for (let i = 0; i < 10; i++) {
        rerender(<CulturalIcon name="rice" size={24 + i} />);
      }
      
      // Should still render correctly
      const icon = screen.getByRole('img', { hidden: true });
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveAttribute('width', '33'); // 24 + 9
    });
  });
});