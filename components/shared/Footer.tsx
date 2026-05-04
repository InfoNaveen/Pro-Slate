import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-[#1A1A2E] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-[#E94560] rounded-md flex items-center justify-center">
                <span className="text-white font-bold text-sm">PS</span>
              </div>
              <span className="font-bold text-white text-lg">ProSlate</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              India's first verified surface finishing labor execution platform. Bengaluru-first.
            </p>
            <p className="text-gray-500 text-xs mt-4">
              📍 Bengaluru, Karnataka, India
            </p>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Services</h4>
            <ul className="space-y-2">
              {['Tile Laying', 'Marble Installation', 'Epoxy Grouting', 'Waterproofing', 'Stone Polishing', 'Floor Leveling', 'Wall Cladding'].map((s) => (
                <li key={s}>
                  <Link href="/services" className="text-gray-400 text-sm hover:text-white transition-colors">{s}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Platform</h4>
            <ul className="space-y-2">
              {[
                { label: 'Find Workers', href: '/workers' },
                { label: 'Get Estimate', href: '/estimate' },
                { label: 'B2B Partnership', href: '/estimate/b2b' },
                { label: 'Join as Worker', href: '/auth/signup' },
                { label: 'Sign In', href: '/auth/login' },
              ].map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-gray-400 text-sm hover:text-white transition-colors">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Contact</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>hello@proslate.in</li>
              <li>+91 98765 43210</li>
              <li className="pt-2">
                <span className="text-xs text-gray-500">Serving all zones in Bengaluru:</span>
                <p className="text-xs text-gray-400 mt-1">Sarjapur · Whitefield · HSR · JP Nagar · Electronic City · Koramangala · Indiranagar · Hebbal</p>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm">© 2024 ProSlate. All rights reserved.</p>
          <p className="text-gray-500 text-xs">India's Verified Surface Finishing Network · Built in Bengaluru</p>
        </div>
      </div>
    </footer>
  );
}
