import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { createLazyFileRoute, useNavigate } from '@tanstack/react-router';
import clsx from 'clsx';
import { Check, X } from 'lucide-react';
import { useState } from 'react';

export const Route = createLazyFileRoute('/pricing')({
  component: RouteComponent,
});

const PRICES = [
  {
    name: 'Basic',
    id: 'tier-basic',
    href: '#',
    price: { monthly: '$0', annually: '$0' },
    description: 'Everything necessary to get started.',
    features: [
      'Up to 1 products',
      'All images, fonts, and icons',
      'Image download ( Up to 1x ratio )',
      'Animation download ( Up to 30FPS )',
    ],
    noFeatures: ['AI tools', '0 GB Cloud Storage'],
  },
  {
    name: 'Pro',
    id: 'tier-pro',
    href: '#',
    price: { monthly: '$12', annually: '$7' },
    description: 'Everything in Basic, plus premium features.',
    features: [
      'Up to 100 products',
      'All images, fonts, and icons',
      'Image download ( Up to 3x ratio )',
      'Animation download ( Up to 240FPS )',
      'AI tools ( 1,000 credits / month )',
      '100GB Cloud Storage',
    ],
    noFeatures: [],
  },
  {
    name: 'Unlimited',
    id: 'tier-unlimited',
    href: '#',
    price: { monthly: '$80', annually: '$50' },
    description: 'Everything in Pro, plus premium features.',
    features: [
      'Unlimited products',
      'AI tools ( 20,000 credits / month )',
      '1TB Cloud Storage',
    ],
    noFeatures: [],
  },
];

function RouteComponent() {
  const navigate = useNavigate();
  const [isAnnual, setIsAnnual] = useState(true);

  const handleGetStarted = (item: (typeof PRICES)[number]) => {
    if (item.id === 'tier-basic') {
      navigate({
        to: '/$projectId',
        params: {
          projectId: '_',
        },
      });
    }
  };

  return (
    <div className="bg-base-100">
      <Header />

      <div className="mx-auto max-w-7xl px-4 py-24 pb-32">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight">
            Simple, transparent pricing
          </h2>
          <p className="mt-4 text-lg leading-8 text-gray-600">
            Choose the plan that's right for you and start creating amazing
            designs today.
          </p>
        </div>
        <div className="mx-auto mt-16 grid grid-cols-1 items-start gap-6 sm:mt-20 sm:gap-y-12 max-w-full lg:grid-cols-3">
          {PRICES.map((tier, tierIdx) => (
            <div className="divide-y divide-base-300 rounded-2xl border border-base-300 shadow-lg bg-white/20 dark:bg-black/20">
              <div className="p-6 sm:px-8">
                <div className="flex items-center justify-between">
                  <h2
                    className={clsx('text-2xl font-medium text-base-content')}
                  >
                    {tier.name}
                    <span className="sr-only">Plan</span>
                  </h2>
                  {tier.id !== 'tier-basic' && (
                    <div className="form-control">
                      <label className="label cursor-pointer gap-2">
                        <span className="label-text">
                          {isAnnual ? 'Annually' : 'Monthly'}
                        </span>
                        <input
                          type="checkbox"
                          className="toggle toggle-primary toggle-sm"
                          checked={isAnnual}
                          onChange={() => setIsAnnual(!isAnnual)}
                        />
                      </label>
                    </div>
                  )}
                </div>

                <p className="mt-2 text-base-content/60">{tier.description}</p>

                {tier.price && (
                  <p className="mt-2 sm:mt-4">
                    <strong className="text-3xl font-bold text-base-content sm:text-4xl">
                      {isAnnual ? tier.price.annually : tier.price.monthly}
                    </strong>
                    <span className="text-sm font-medium text-base-content">
                      /month
                    </span>
                  </p>
                )}

                <button
                  className={clsx(
                    'btn btn-outline mt-4 w-full transition-all rounded-xl',
                    tier.id !== 'tier-basic' && 'btn-primary',
                  )}
                  onClick={() => handleGetStarted(tier)}
                >
                  Get Started
                </button>
              </div>

              <div className="p-6 sm:px-8">
                <p className="text-lg font-medium sm:text-xl">
                  What's included:
                </p>

                <ul className="mt-2 space-y-2 sm:mt-4">
                  {tier.features.map((feature) => (
                    <li className="flex items-center gap-1">
                      <Check size={22} className="text-primary" />
                      <span>{feature}</span>
                    </li>
                  ))}
                  {tier.noFeatures.map((feature) => (
                    <li className="flex items-center gap-1 opacity-50">
                      <X size={22} />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
}
