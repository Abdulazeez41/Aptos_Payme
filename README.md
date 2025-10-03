# Aptos PayMe 💸

**PayPal.Me, But On-Chain — the payments rail for Aptos.**

> *"If Aptos is the Global Trading Engine, PayMe is the payments rail that keeps fuel flowing in and out of it."*

PayMe makes on-chain payments as simple as sharing a link. Create ANS-friendly payment requests or QR codes, recipients pay with one click, and payments settle instantly on Aptos with on-chain receipts and webhook notifications for merchants.

![Aptos PayMe](https://img.shields.io/badge/Built%20on-Aptos-00D4FF?style=for-the-badge&logo=aptos)
![Version](https://img.shields.io/badge/Version-1.0.0-green?style=for-the-badge)

## ✨ Features

- **🚀 Lightning Fast**: Instant on-chain payments with Aptos' sub-second finality
- **🌍 Global & Permissionless**: Send and receive payments anywhere in the world
- **🔒 Ultra Secure**: Non-custodial, direct wallet-to-wallet transfers
- **📱 One-Click Sharing**: Generate QR codes and shareable payment links
- **⏰ Time-Bound Requests**: Automatic expiry for stale payment requests
- **📊 Full History**: Track all your payment requests and transactions
- **💰 Multi-Asset Support**: Accept payments in APT, USDC, and other Aptos tokens

## 🏗️ Architecture

### Frontend (`/client`)

- **React 19** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for modern, responsive UI
- **React Router** for client-side routing
- **Aptos Wallet Adapter** for seamless wallet integration
- **Lucide React** for beautiful icons

### Smart Contracts (`/contracts`)

- **Move** smart contracts on Aptos blockchain
- Deployed at: `0x8e1ae3070ec91bb532197041d01efa308b5eb02dda9c746c3ba43af7df730f4e`
- Features:
  - Payment request creation and management
  - Automatic expiry handling
  - Event emission for full auditability
  - Support for any fungible asset on Aptos

## 🗺️ Our Vision: Roadmap

### Foundation & Frictionless UX
*Eliminating every barrier to entry*
- **Integrate Aptos Name Service (ANS)**: `username.apt` instead of wallet addresses
- **Sponsored Transactions**: $0 gas fees for users
- **Recurring Payments**: Subscriptions, salaries, allowances
- **P2P Send**: users send tokens directly to Aptos addresses or ANS names

### Become a Payment Primitive  
*From standalone app to ecosystem infrastructure*
- **Developer API/SDK**: Any dApp can integrate PayMe checkout
- **Extended Token Support**: All Aptos tokens, not just stablecoins
- **Aptos Connect**: Social logins and keyless wallets
- **Mobile App**: Build a mobile version of PayMe

### Programmable Money & DeFi
*Leveraging Aptos as a trading engine*
- **"Pay & Auto-Invest"**: Direct deposits into lending/vaults
- **Conditional Payments**: Escrow, milestone-based releases
- **Business Invoicing**: Due dates, late fees, tracking

### Cross-Chain & Global Commerce
*Making Aptos the hub for global value movement*
- **Cross-Chain via CCTP**: Ethereum users can pay Aptos links
- **Physical Commerce**: Enhanced QR codes with NFC suports for retail
- **Advanced Analytics**: Business insights, tax reporting

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm/yarn
- An Aptos wallet (Petra, Martian, Pontem, etc.)
- Some APT or USDC for testing

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/Abdulazeez41/Aptos_Payme.git
   cd Aptos_Payme
   ```

2. **Install dependencies**

   ```bash
   cd client
   npm install
   ```

3. **Start development server**

   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

### Building for Production

```bash
cd client
npm run build
```

The built files will be in the `client/dist` directory.

## 🎯 How It Works

1. **Connect Wallet**: Connect your Aptos wallet (Petra, Martian, etc.)
2. **Create Request**: Set amount, token type, description, and expiry time
3. **Share Link**: Get a shareable payment link and QR code
4. **Get Paid**: Recipients pay directly through the link
5. **Track History**: Monitor all your payment requests and transactions

## 📱 Pages & Features

### 🏠 Home

- Hero section with app overview
- Feature highlights
- Quick access to main actions

### 💳 Create Payment Request

- Set payment amount and token type (APT, USDC)
- Add description and expiry time
- Generate shareable link and QR code
- Copy link or share directly

### 💰 Payment Page (`/pay/:requestId`)

- Public payment interface for recipients
- Shows payment details and amount
- One-click payment with wallet connection
- Payment confirmation and success states

### 📊 History

- View all your payment requests
- Filter by status (pending, paid, expired, cancelled)
- Track payment amounts and timestamps
- Cancel pending requests

## 🛠️ Development

### Project Structure

```
Aptos_Payme/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── contexts/       # React contexts (Wallet)
│   │   ├── hooks/          # Custom React hooks
│   │   ├── pages/          # Page components
│   │   ├── types/          # TypeScript type definitions
│   │   └── utils/          # Utility functions
│   ├── dist/              # Built files
│   └── public/            # Static assets
├── contracts/             # Move smart contracts
│   ├── sources/           # Contract source files
│   └── Move.toml         # Move package configuration
└── README.md
```

### Available Scripts

In the `client` directory:

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Smart Contract Development

The Move contracts are located in `/contracts/sources/`:

- `payme.move` - Main payment request contract
- `test_token.move` - Test token for development

To deploy contracts:

```bash
cd contracts
aptos move publish --profile default
```

## 🔧 Configuration

### Supported Wallets

- Petra Wallet
- Martian Wallet
- Pontem Wallet
- Fewcha Wallet
- And more Aptos-compatible wallets

## 🌐 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Set build settings:
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. Deploy!

The app includes `vercel.json` configuration for proper SPA routing.

### Other Platforms

The app can be deployed to any static hosting service:

- Netlify
- GitHub Pages
- AWS S3 + CloudFront
- Firebase Hosting

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built on the [Aptos](https://aptos.dev) blockchain
- Inspired by PayPal.Me's simplicity
- UI components powered by [Tailwind CSS](https://tailwindcss.com)
- Icons by [Lucide](https://lucide.dev)

## 📞 Support

- 🐛 **Issues**: [GitHub Issues](https://github.com/yourusername/Aptos_Payme/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/yourusername/Aptos_Payme/discussions)
- 🌐 **Website**: [aptospayme.vercel.app](https://aptospayme.vercel.app)

---

**Made with ❤️ for the Aptos ecosystem**
