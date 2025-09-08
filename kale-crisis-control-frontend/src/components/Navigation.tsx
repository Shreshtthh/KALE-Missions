import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useWallet } from '@/lib/wallet';
import { useMissionStore } from '@/stores/missionStore';
import { useToast } from '@/hooks/use-toast';
import { 
  Rocket, 
  Wallet, 
  ChevronDown, 
  LogOut, 
  User,
  Database,
  TestTube,
  Loader2,
  Menu,
  X
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

export const Navigation = () => {
  const location = useLocation();
  const { wallet, connectFreighter, connectXBull, disconnect } = useWallet();
  const { useRealData, toggleDataSource, loading } = useMissionStore();
  const { toast } = useToast();
  const [isConnecting, setIsConnecting] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleWalletConnect = async (walletType: 'freighter' | 'xbull') => {
    setIsConnecting(true);
    try {
      if (walletType === 'freighter') {
        await connectFreighter();
      } else {
        await connectXBull();
      }
      toast({
        title: "Wallet Connected",
        description: `Successfully connected to ${walletType} wallet`,
      });
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleToggleDataSource = () => {
    toggleDataSource();
    toast({
      title: "Mode Changed",
      description: useRealData 
        ? "Switched to Demo Mode - using mock data for presentations" 
        : "Switched to Live Mode - connecting to Soroban blockchain",
    });
  };

  const isActive = (path: string) => location.pathname === path;

  const navigationItems = [
    { path: '/', label: 'Dashboard' },
    { path: '/my-missions', label: 'My Missions' },
    { path: '/admin', label: 'Admin' },
  ];

  return (
    <nav className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <Rocket className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl text-foreground">KALE Missions</span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            {navigationItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  isActive(item.path) ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Right side controls */}
          <div className="flex items-center space-x-4">
            {/* Loading indicator */}
            {loading && (
              <div className="hidden sm:flex items-center text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Loading...
              </div>
            )}

            {/* Data Source Toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleToggleDataSource}
              className="hidden sm:flex items-center space-x-2"
            >
              {useRealData ? (
                <>
                  <Database className="h-4 w-4" />
                  <span>Live Mode</span>
                </>
              ) : (
                <>
                  <TestTube className="h-4 w-4" />
                  <span>Demo Mode</span>
                </>
              )}
            </Button>

            {/* Mode indicator badge */}
            <Badge variant={useRealData ? "default" : "secondary"} className="hidden sm:inline-flex">
              {useRealData ? "LIVE" : "DEMO"}
            </Badge>

            {/* Wallet Connection */}
            {wallet.connected ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center space-x-2">
                    <Wallet className="h-4 w-4" />
                    <span className="hidden sm:inline">
                      {wallet.address?.slice(0, 6)}...{wallet.address?.slice(-4)}
                    </span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64">
                  <DropdownMenuItem>
                    <User className="h-4 w-4 mr-2" />
                    <div className="flex flex-col">
                      <span className="font-medium">{wallet.walletType}</span>
                      <span className="text-xs text-muted-foreground font-mono">
                        {wallet.address}
                      </span>
                    </div>
                  </DropdownMenuItem>
                  
                  {wallet.balance?.xlm !== undefined && (
                    <DropdownMenuItem>
                      <div className="flex flex-col">
                        <span className="font-medium">Balance</span>
                        <span className="text-sm text-muted-foreground">
                          {wallet.balance.xlm.toFixed(4)} XLM
                        </span>
                      </div>
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={disconnect}
                    className="text-destructive hover:bg-destructive/10"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Disconnect Wallet
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button disabled={isConnecting} className="flex items-center space-x-2">
                    {isConnecting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="hidden sm:inline">Connecting...</span>
                      </>
                    ) : (
                      <>
                        <Wallet className="h-4 w-4" />
                        <span className="hidden sm:inline">Connect Wallet</span>
                      </>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => handleWalletConnect('freighter')}>
                    <span className="mr-2">🚀</span>
                    Freighter
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleWalletConnect('xbull')}>
                    <span className="mr-2">🐂</span>
                    xBull
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-border pt-4">
            <div className="flex flex-col space-y-4">
              {/* Mobile Navigation Links */}
              {navigationItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    isActive(item.path) ? 'text-primary' : 'text-muted-foreground'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}

              {/* Mobile Mode Toggle */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleToggleDataSource}
                className="justify-start"
              >
                {useRealData ? (
                  <>
                    <Database className="h-4 w-4 mr-2" />
                    Live Mode
                  </>
                ) : (
                  <>
                    <TestTube className="h-4 w-4 mr-2" />
                    Demo Mode
                  </>
                )}
              </Button>

              <Badge variant={useRealData ? "default" : "secondary"} className="w-fit">
                {useRealData ? "LIVE" : "DEMO"}
              </Badge>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
