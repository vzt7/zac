import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'
import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/about')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="bg-base-100">
      <Header />

      <section>
        <div className="mx-auto max-w-screen-xl px-4 py-32 lg:flex lg:min-h-[66vh] lg:items-center">
          <div className="mx-auto max-w-xl text-center">
            <h1 className="text-3xl font-extrabold sm:text-5xl">
              About Poster Master
              <strong className="font-extrabold text-primary sm:block">
                {' '}
                Our Story{' '}
              </strong>
            </h1>

            <p className="mt-4 sm:text-xl/relaxed">
              We're on a mission to make design accessible to everyone. Our
              journey began with a simple idea: empower creativity through
              technology.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-base-300">
        <div className="mx-auto max-w-screen-xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-16">
            <div className="relative h-64 overflow-hidden rounded-lg sm:h-80 lg:h-full">
              <img
                alt="Team"
                src="/placeholder.svg"
                width={500}
                height={500}
                className="absolute inset-0 h-full w-full object-cover"
              />
            </div>

            <div className="lg:py-24">
              <h2 className="text-3xl font-bold sm:text-4xl">Our Mission</h2>

              <p className="mt-4 text-gray-600">
                At Poster Master, we believe that everyone has the potential to
                create beautiful designs. Our platform is built to nurture
                creativity, providing tools that are powerful yet easy to use.
                We're committed to continually improving our service, ensuring
                that our users always have access to cutting-edge design
                capabilities.
              </p>

              <p className="mt-4 text-gray-600">
                Our team is composed of passionate individuals from diverse
                backgrounds, united by our love for design and technology. We
                work tirelessly to bring you the best possible design
                experience, and we're always excited to hear from our users
                about how we can make Poster Master even better.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
