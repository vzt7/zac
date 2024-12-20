import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { createLazyFileRoute } from '@tanstack/react-router';

export const Route = createLazyFileRoute('/pricing')({
  component: RouteComponent,
});

function RouteComponent() {
  return null;

  const handleGetStarted = () => {
    // TODO: 跳转到登录页面
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
        <div className="mx-auto mt-16 grid max-w-lg grid-cols-1 items-center gap-y-6 sm:mt-20 sm:gap-y-12 lg:max-w-4xl lg:grid-cols-2">
          {[
            {
              name: 'Basic',
              id: 'tier-basic',
              href: '#',
              price: { monthly: '$15', annually: '$12' },
              description: 'Everything necessary to get started.',
              features: [
                '5 products',
                'Up to 1,000 subscribers',
                'Basic analytics',
              ],
              featured: false,
            },
            {
              name: 'Pro',
              id: 'tier-pro',
              href: '#',
              price: { monthly: '$30', annually: '$24' },
              description: 'Everything in Basic, plus premium features.',
              features: [
                'Unlimited products',
                'Unlimited subscribers',
                'Advanced analytics',
                'Custom font uploads',
                '24/7 support',
              ],
              featured: true,
            },
          ].map((tier, tierIdx) => (
            <div
              key={tier.id}
              className={`flex flex-col justify-between rounded-3xl p-8 shadow-xl ring-1 ring-gray-900/10 sm:p-10 ${
                tier.featured
                  ? 'relative shadow-2xl bg-gradient-to-tr border-2 border-gray-700 from-black to-gray-700'
                  : 'lg:mt-4 bg-white'
              } ${tierIdx === 0 ? 'lg:rounded-r-none' : ''} ${
                tierIdx === 1 ? 'lg:rounded-l-none' : ''
              }`}
            >
              <div>
                <h3
                  id={tier.id}
                  className={`text-xl font-semibold leading-7 ${
                    tier.featured ? 'text-white !text-2xl' : 'text-primary'
                  }`}
                >
                  {tier.name}
                </h3>
                <div className="mt-4 flex items-baseline gap-x-2">
                  <span
                    className={`text-5xl font-bold tracking-tight ${
                      tier.featured ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    {tier.price.monthly}
                  </span>
                  <span
                    className={`text-base font-semibold leading-7 ${
                      tier.featured ? 'text-gray-300' : 'text-gray-600'
                    }`}
                  >
                    /month
                  </span>
                </div>
                <p
                  className={`mt-6 text-base leading-7 ${
                    tier.featured ? 'text-gray-300' : 'text-gray-600'
                  }`}
                >
                  {tier.description}
                </p>
                <ul
                  role="list"
                  className={`mt-8 space-y-3 text-sm leading-6 ${
                    tier.featured ? 'text-gray-300' : 'text-gray-600'
                  }`}
                >
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex gap-x-3">
                      <svg
                        className={`h-6 w-5 flex-none ${
                          tier.featured ? 'text-white' : 'text-black'
                        }`}
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              <button
                aria-describedby={tier.id}
                className={`btn mt-8 block rounded-md px-3 py-2 text-center text-sm font-semibold leading-6 ${
                  tier.featured
                    ? 'bg-white text-gray-900 hover:bg-gray-300'
                    : 'btn-primary text-white shadow-sm hover:bg-primary/80'
                }`}
                onClick={handleGetStarted}
              >
                Get started
              </button>
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
}
