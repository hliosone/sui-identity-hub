"use client";

import { useEffect, useState } from 'react';
import { ArrowLeft, FileText, Send, AlertCircle, CheckCircle, Calendar, User, Tag, Globe, Sparkles, Shield, Clock, Zap, ChevronRight, Copy, Eye, Info, ChevronLeft, Home, Upload, FileJson, ClipboardPaste, Mail, UserPlus, Wallet, X } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Progress } from './ui/progress';
import { useRouter } from "next/navigation";
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';

export function CredentialsIssuance() {
  const [isIssuing, setIsIssuing] = useState(false);
  const [issued, setIssued] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [showPreview, setShowPreview] = useState(false);
  const [isBackButtonCollapsed, setIsBackButtonCollapsed] = useState(true);
  const [formData, setFormData] = useState({
    subject: '',
    type: '',
    customType: '',
    scopes: '',
    expirationDate: '',
    description: '',
    additionalFields: ''
  });
  const [scopeBuilder, setScopeBuilder] = useState({
    selectedScopes: [] as Array<{ category: string; permission: string; icon: string; color: string; description: string }>,
    customScope: { category: '', permission: '', description: '' },
    showCustomBuilder: false
  });
  const [jsonInput, setJsonInput] = useState('');
  const [jsonInputMethod, setJsonInputMethod] = useState<'textarea' | 'file'>('textarea');
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [recipientMethod, setRecipientMethod] = useState<'did' | 'email'>('did');
  const [emailOnboarding, setEmailOnboarding] = useState({
    email: '',
    isCreating: false,
    created: false,
    generatedDID: ''
  });

  const { user, primaryWallet } = useDynamicContext();

  const router = useRouter();

  const scopeCategories = [
    {
      category: 'kyc',
      label: 'KYC Verification',
      icon: '🔐',
      color: 'bg-blue-500',
      lightColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-700',
      description: 'Identity verification and compliance',
      permissions: [
        { level: 'level1', label: 'Level 1', description: 'Basic identity verification' },
        { level: 'level2', label: 'Level 2', description: 'Enhanced verification for trading' },
        { level: 'level3', label: 'Level 3', description: 'Full institutional compliance' }
      ]
    },
    {
      category: 'access',
      label: 'Platform Access',
      icon: '🚪',
      color: 'bg-green-500',
      lightColor: 'bg-green-50',
      borderColor: 'border-green-200',
      textColor: 'text-green-700',
      description: 'Platform and feature access controls',
      permissions: [
        { level: 'basic', label: 'Basic', description: 'Standard platform features' },
        { level: 'premium', label: 'Premium', description: 'Advanced features and tools' },
        { level: 'vip', label: 'VIP', description: 'Exclusive features and support' }
      ]
    },
    {
      category: 'trading',
      label: 'Trading Rights',
      icon: '📈',
      color: 'bg-purple-500',
      lightColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      textColor: 'text-purple-700',
      description: 'Trading capabilities and limits',
      permissions: [
        { level: 'spot', label: 'Spot Trading', description: 'Basic spot trading only' },
        { level: 'margin', label: 'Margin Trading', description: 'Leverage trading capabilities' },
        { level: 'derivatives', label: 'Derivatives', description: 'Advanced trading instruments' }
      ]
    },
    {
      category: 'withdrawal',
      label: 'Withdrawal Limits',
      icon: '💰',
      color: 'bg-orange-500',
      lightColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      textColor: 'text-orange-700',
      description: 'Asset withdrawal permissions',
      permissions: [
        { level: 'limited', label: 'Limited', description: 'Basic withdrawal limits' },
        { level: 'standard', label: 'Standard', description: 'Increased daily limits' },
        { level: 'unlimited', label: 'Unlimited', description: 'No withdrawal restrictions' }
      ]
    },
    {
      category: 'identity',
      label: 'Identity Status',
      icon: '👤',
      color: 'bg-cyan-500',
      lightColor: 'bg-cyan-50',
      borderColor: 'border-cyan-200',
      textColor: 'text-cyan-700',
      description: 'User identity and profile status',
      permissions: [
        { level: 'basic', label: 'Basic', description: 'Standard user profile' },
        { level: 'verified', label: 'Verified', description: 'Identity verified user' },
        { level: 'institutional', label: 'Institutional', description: 'Corporate account status' }
      ]
    },
    {
      category: 'api',
      label: 'API Access',
      icon: '🔌',
      color: 'bg-indigo-500',
      lightColor: 'bg-indigo-50',
      borderColor: 'border-indigo-200',
      textColor: 'text-indigo-700',
      description: 'API usage and rate limits',
      permissions: [
        { level: 'readonly', label: 'Read Only', description: 'View-only API access' },
        { level: 'trading', label: 'Trading', description: 'Full trading API access' },
        { level: 'admin', label: 'Admin', description: 'Administrative API access' }
      ]
    }
  ];

  const credentialTypes = [
    { 
      value: 'VerifiableCredential', 
      label: 'Basic Verifiable Credential',
      description: 'Standard verifiable credential for general use',
      icon: '📄'
    },
    { 
      value: 'EducationCredential', 
      label: 'Education Credential',
      description: 'Certifies educational achievements and qualifications',
      icon: '🎓'
    },
    { 
      value: 'EmploymentCredential', 
      label: 'Employment Credential',
      description: 'Verifies employment status and work history',
      icon: '💼'
    },
    { 
      value: 'SkillCredential', 
      label: 'Skill Credential',
      description: 'Validates technical skills and competencies',
      icon: '⚡'
    },
    { 
      value: 'CertificationCredential', 
      label: 'Certification Credential',
      description: 'Professional certifications and licenses',
      icon: '🏆'
    },
    { 
      value: 'KYCCredential', 
      label: 'KYC Credential',
      description: 'Identity verification and compliance credentials',
      icon: '🔐'
    },
    { 
      value: 'custom', 
      label: 'Custom Type',
      description: 'Create a custom credential type',
      icon: '🎨'
    }
  ];

  const steps = [
    { number: 1, title: 'Basic Info', description: 'Recipient and type' },
    { number: 2, title: 'Details', description: 'Scopes and metadata' },
    { number: 3, title: 'Review', description: 'Final validation' }
  ];

  const handleIssue = async () => {
    setIsIssuing(true);
    
    // Simulate gasless transaction with progress updates
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsIssuing(false);
    setIssued(true);
    
    // Reset form after 5 seconds
    setTimeout(() => {
      setIssued(false);
      setCurrentStep(1);
      setFormData({
        subject: '',
        type: '',
        customType: '',
        scopes: '',
        expirationDate: '',
        description: '',
        additionalFields: ''
      });
      setJsonInput('');
      setUploadedFileName('');
      setEmailOnboarding({
        email: '',
        isCreating: false,
        created: false,
        generatedDID: ''
      });
      setRecipientMethod('did');
      setScopeBuilder({
        selectedScopes: [],
        customScope: { category: '', permission: '', description: '' },
        showCustomBuilder: false
      });
    }, 5000);
  };

  const addScope = (category: string, permission: string) => {
    const scopeCategory = scopeCategories.find(sc => sc.category === category);
    const permissionInfo = scopeCategory?.permissions.find(p => p.level === permission);
    
    if (scopeCategory && permissionInfo) {
      const newScope = {
        category,
        permission,
        icon: scopeCategory.icon,
        color: scopeCategory.color,
        description: permissionInfo.description
      };
      
      // Remove existing scope with same category if it exists
      const filteredScopes = scopeBuilder.selectedScopes.filter(s => s.category !== category);
      const updatedScopes = [...filteredScopes, newScope];
      
      setScopeBuilder(prev => ({ ...prev, selectedScopes: updatedScopes }));
      updateScopesString(updatedScopes);
    }
  };

  const removeScope = (category: string) => {
    const updatedScopes = scopeBuilder.selectedScopes.filter(s => s.category !== category);
    setScopeBuilder(prev => ({ ...prev, selectedScopes: updatedScopes }));
    updateScopesString(updatedScopes);
  };

  const addCustomScope = () => {
    if (scopeBuilder.customScope.category && scopeBuilder.customScope.permission) {
      const newScope = {
        category: scopeBuilder.customScope.category,
        permission: scopeBuilder.customScope.permission,
        icon: '⚙️',
        color: 'bg-gray-500',
        description: scopeBuilder.customScope.description || 'Custom scope'
      };
      
      const filteredScopes = scopeBuilder.selectedScopes.filter(s => s.category !== newScope.category);
      const updatedScopes = [...filteredScopes, newScope];
      
      setScopeBuilder(prev => ({ 
        ...prev, 
        selectedScopes: updatedScopes,
        customScope: { category: '', permission: '', description: '' },
        showCustomBuilder: false
      }));
      updateScopesString(updatedScopes);
    }
  };

  const updateScopesString = (scopes: typeof scopeBuilder.selectedScopes) => {
    const scopesString = scopes.map(s => `${s.category}:${s.permission}`).join(', ');
    setFormData(prev => ({ ...prev, scopes: scopesString }));
  };

  // Initialize scopeBuilder from existing formData.scopes
  useEffect(() => {
    if (formData.scopes && scopeBuilder.selectedScopes.length === 0) {
      const existingScopes = parseScopes(formData.scopes);
      const initialScopes = Object.entries(existingScopes).map(([category, permission]) => {
        const scopeCategory = scopeCategories.find(sc => sc.category === category);
        return {
          category,
          permission: permission as string,
          icon: scopeCategory?.icon || '⚙️',
          color: scopeCategory?.color || 'bg-gray-500',
          description: scopeCategory?.permissions.find(p => p.level === permission)?.description || 'Custom scope'
        };
      });
      
      if (initialScopes.length > 0) {
        setScopeBuilder(prev => ({ ...prev, selectedScopes: initialScopes }));
      }
    }
  }, [formData.scopes]);

  const parseScopes = (scopesString: string) => {
    try {
      if (!scopesString.trim()) return {};
      
      if (scopesString.trim().startsWith('{')) {
        return JSON.parse(scopesString);
      } else {
        const scopes: Record<string, string> = {};
        scopesString.split(',').forEach(pair => {
          const [key, value] = pair.trim().split(':');
          if (key && value) {
            scopes[key.trim()] = value.trim().replace(/"/g, '');
          }
        });
        return scopes;
      }
    } catch {
      return {};
    }
  };

  const parseAdditionalFields = (fieldsString: string) => {
    try {
      if (!fieldsString.trim()) return {};
      return JSON.parse(fieldsString);
    } catch {
      return {};
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/json') {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const parsed = JSON.parse(content);
          setJsonInput(JSON.stringify(parsed, null, 2));
          setUploadedFileName(file.name);
          setFormData(prev => ({ ...prev, additionalFields: JSON.stringify(parsed, null, 2) }));
        } catch (error) {
          alert('Invalid JSON file format');
        }
      };
      reader.readAsText(file);
    } else {
      alert('Please upload a valid JSON file');
    }
  };

  const handleJsonPaste = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      setFormData(prev => ({ ...prev, additionalFields: JSON.stringify(parsed, null, 2) }));
    } catch (error) {
      alert('Invalid JSON format');
    }
  };

  const isValidJson = (jsonString: string) => {
    try {
      if (!jsonString.trim()) return true;
      JSON.parse(jsonString);
      return true;
    } catch {
      return false;
    }
  };

  const handleEmailOnboarding = async () => {
    setEmailOnboarding(prev => ({ ...prev, isCreating: true }));
    
    // Simulate wallet creation and DiD generation
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    const newDID = `did:sui:0x${Math.random().toString(16).substr(2, 16)}`;
    setEmailOnboarding(prev => ({ 
      ...prev, 
      isCreating: false, 
      created: true, 
      generatedDID: newDID 
    }));
    
    // Auto-fill the subject field with the new DiD
    setFormData(prev => ({ ...prev, subject: newDID }));
  };

  const isStepValid = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.subject.trim() && (formData.type || formData.customType.trim()));
      case 2:
        return true; // Optional fields
      case 3:
        return isStepValid(1) && isStepValid(2);
      default:
        return false;
    }
  };

  const getSelectedCredentialType = () => {
    return credentialTypes.find(type => type.value === formData.type);
  };

  const CollapsibleBackButton = ({ variant = "ghost", className = "" }: { variant?: "ghost" | "outline", className?: string }) => {
    return (
      <div 
        className="flex items-center"
        onMouseEnter={() => setIsBackButtonCollapsed(false)}
        onMouseLeave={() => setIsBackButtonCollapsed(true)}
      >
        <Button 
          variant={variant} 
          onClick={() => {
            router.push('/dashboard');
          }} 
          className={`transition-all duration-300 ease-in-out overflow-hidden ${className} ${
            isBackButtonCollapsed ? 'w-10 px-0' : 'w-auto px-4'
          }`}
        >
          <div className="flex items-center whitespace-nowrap">
            {isBackButtonCollapsed ? (
              <Home className="h-4 w-4" />
            ) : (
              <>
                <ArrowLeft className="h-4 w-4 mr-2" />
                <span className="transition-opacity duration-300">Back to Dashboard</span>
              </>
            )}
          </div>
        </Button>
      </div>
    );
  };

  if (!primaryWallet || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-cyan-50 p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center gap-4">
            <CollapsibleBackButton variant="ghost" className="sui-border hover:sui-bg-light" />
          </div>

          <div className="text-center">
            <div className="mx-auto w-20 h-20 sui-gradient rounded-full flex items-center justify-center mb-6">
              <FileText className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-2">
              Credentials Issuance
            </h1>
            <p className="text-slate-600 mb-8">Issue verifiable credentials on the Sui Network</p>
          </div>

          <Card className="max-w-md mx-auto sui-shadow">
            <CardContent className="text-center py-12">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="h-8 w-8 text-orange-600" />
              </div>
              <h2 className="text-xl font-semibold mb-2">DiD Required</h2>
              <p className="text-slate-600 mb-6">
                You need to create a SUI DiD before you can issue credentials. 
                A DiD is required to act as the issuer of verifiable credentials.
              </p>
              <Button onClick={() => router.back()} className="sui-gradient text-white">
                Go to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (issued) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-slate-50 to-emerald-50 p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center gap-4">
            <CollapsibleBackButton variant="ghost" className="border border-green-200 hover:bg-green-50" />
          </div>

          <div className="text-center">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mb-6 animate-pulse">
              <CheckCircle className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-700 bg-clip-text text-transparent mb-2">
              Credential Issued Successfully!
            </h1>
            <p className="text-slate-600 mb-8">Your credential has been successfully issued on the Sui Network</p>
          </div>

          <Card className="max-w-2xl mx-auto shadow-xl border-0 bg-white/70 backdrop-blur-sm">
            <CardContent className="p-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <Zap className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-green-800">Gasless Transaction</p>
                    <p className="text-sm text-green-600">Completed</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <Shield className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-blue-800">Blockchain Storage</p>
                    <p className="text-sm text-blue-600">Secured on Sui</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-4 bg-orange-50 rounded-lg">
                  <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                    <FileJson className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-orange-800">Walrus Storage</p>
                    <p className="text-sm text-orange-600">Metadata stored</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg">
                  <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                    <Send className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-purple-800">Recipient Notified</p>
                    <p className="text-sm text-purple-600">Ready to claim</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-green-800 mb-2">Transaction Details</h3>
                    <div className="space-y-1 text-sm text-green-700">
                      <p>• Credential Type: {formData.type === 'custom' ? formData.customType : getSelectedCredentialType()?.label}</p>
                      <p>• Recipient: {formData.subject}</p>
                      <p>• Issuer: {user.username || 'SUI Identity'}</p>
                      <p>• Network: Sui Blockchain (Gasless)</p>
                      {formData.additionalFields && <p>• Metadata: Stored on IPFS</p>}
                      {emailOnboarding.created && <p>• Email onboarding: {emailOnboarding.email}</p>}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-cyan-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <CollapsibleBackButton variant="ghost" className="sui-border hover:sui-bg-light" />
          <div className="flex-1">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent flex items-center gap-3">
              <div className="w-10 h-10 sui-gradient rounded-lg flex items-center justify-center">
                <FileText className="h-6 w-6 text-white" />
              </div>
              Credentials Issuance
            </h1>
            <p className="text-slate-600 mt-2">Issue verifiable credentials to individuals or organizations on Sui Network</p>
          </div>
        </div>

        {/* Progress Steps */}
        <Card className="sui-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              {steps.map((step, index) => (
                <div key={step.number}>
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                      currentStep >= step.number 
                        ? 'sui-gradient text-white border-blue-500' 
                        : 'border-slate-300 text-slate-400'
                    }`}>
                      {currentStep > step.number ? (
                        <CheckCircle className="h-5 w-5" />
                      ) : (
                        <span className="font-semibold">{step.number}</span>
                      )}
                    </div>
                    <div>
                      <p className={`font-medium ${currentStep >= step.number ? 'sui-text' : 'text-slate-400'}`}>
                        {step.title}
                      </p>
                      <p className="text-sm text-slate-500">{step.description}</p>
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-4 transition-all duration-300 ${
                      currentStep > step.number ? 'sui-bg' : 'bg-slate-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar - Issuer Info */}
          <div className="lg:col-span-1">
            <Card className="sui-shadow sticky top-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 sui-text" />
                  Issuer Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-slate-600 flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Issuer DiD
                  </Label>
                  <div className="p-3 sui-bg-light rounded-lg mt-1 group cursor-pointer" onClick={() => navigator.clipboard.writeText(primaryWallet.address || '')} title="Click to copy">
                    <div className="font-mono text-sm break-all text-slate-700">{user ? `did:sui:${primaryWallet.address}` : 'Not connected'}</div>
                    <Copy className="h-3 w-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity mt-1" />
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-slate-600 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Name
                  </Label>
                  <div className="p-3 sui-bg-light rounded-lg mt-1">
                    <div className="text-sm font-medium">{user.username || 'Not specified'}</div>
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-slate-600 flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    Organization
                  </Label>
                  <div className="p-3 sui-bg-light rounded-lg mt-1">
                    <div className="text-sm">{'Not specified'}</div>
                  </div>
                </div>

                <Separator />
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-600">Quick Stats</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-center p-2 bg-blue-50 rounded">
                      <div className="text-lg font-bold text-blue-600">∞</div>
                      <div className="text-xs text-blue-600">Gas Free</div>
                    </div>
                    <div className="text-center p-2 bg-green-50 rounded">
                      <div className="text-lg font-bold text-green-600">⚡</div>
                      <div className="text-xs text-green-600">Instant</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Card className="sui-shadow">
              <CardContent className="p-6">
                {/* Step 1: Basic Information */}
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-8 h-8 sui-gradient rounded-lg flex items-center justify-center">
                        <User className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold">Basic Information</h2>
                        <p className="text-slate-600">Specify the recipient and credential type</p>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="space-y-4">
                        <div>
                          <Label className="flex items-center gap-2 mb-3">
                            <Send className="h-4 w-4" />
                            Recipient Information *
                          </Label>
                          <div className="flex gap-2 mb-4">
                            <Button
                              type="button"
                              variant={recipientMethod === 'did' ? 'default' : 'outline'}
                              onClick={() => setRecipientMethod('did')}
                              className={`flex-1 ${recipientMethod === 'did' ? 'sui-gradient text-white' : 'sui-border'}`}
                            >
                              <Wallet className="h-4 w-4 mr-2" />
                              Existing DiD
                            </Button>
                            <Button
                              type="button"
                              variant={recipientMethod === 'email' ? 'default' : 'outline'}
                              onClick={() => setRecipientMethod('email')}
                              className={`flex-1 ${recipientMethod === 'email' ? 'sui-gradient text-white' : 'sui-border'}`}
                            >
                              <Mail className="h-4 w-4 mr-2" />
                              Email Onboarding
                            </Button>
                          </div>
                        </div>

                        {recipientMethod === 'did' ? (
                          <div className="space-y-2">
                            <Label htmlFor="subject">Recipient DiD Address *</Label>
                            <Input
                              id="subject"
                              value={formData.subject}
                              onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                              placeholder="did:sui:0x1234567890abcdef..."
                              className="font-mono h-12 sui-border focus:ring-2 focus:ring-blue-500"
                            />
                            <p className="text-sm text-slate-500 flex items-center gap-2">
                              <Info className="h-4 w-4" />
                              The SUI DiD of the credential recipient
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {!emailOnboarding.created ? (
                              <div className="space-y-3">
                                <Label htmlFor="recipientEmail">Recipient Email Address *</Label>
                                <Input
                                  id="recipientEmail"
                                  type="email"
                                  value={emailOnboarding.email}
                                  onChange={(e) => setEmailOnboarding(prev => ({ ...prev, email: e.target.value }))}
                                  placeholder="recipient@example.com"
                                  className="h-12"
                                  disabled={emailOnboarding.isCreating}
                                />
                                <p className="text-sm text-slate-500 flex items-center gap-2">
                                  <UserPlus className="h-4 w-4" />
                                  We'll create a SUI wallet and DiD for this email address
                                </p>
                                
                                {emailOnboarding.email && !emailOnboarding.isCreating && (
                                  <Button 
                                    onClick={handleEmailOnboarding}
                                    disabled={!emailOnboarding.email.includes('@')}
                                    className="w-full sui-gradient text-white"
                                  >
                                    <UserPlus className="h-4 w-4 mr-2" />
                                    Create Wallet & DiD for User
                                  </Button>
                                )}
                                
                                {emailOnboarding.isCreating && (
                                  <div className="p-4 sui-bg-light rounded-lg">
                                    <div className="flex items-center gap-3">
                                      <div className="animate-spin w-5 h-5 border-2 sui-border-light border-t-blue-600 rounded-full"></div>
                                      <div>
                                        <p className="font-medium">Creating wallet and DiD...</p>
                                        <p className="text-sm text-slate-600">This may take a few moments</p>
                                      </div>
                                    </div>
                                    <div className="mt-3 space-y-2 text-sm text-slate-600">
                                      <div className="flex items-center gap-2">
                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                        <span>Generating cryptographic keys...</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                        <span>Creating DiD on Sui Network...</span>
                                      </div>
                                      <div className="flex items-center gap-2 opacity-60">
                                        <Clock className="h-4 w-4" />
                                        <span>Sending welcome email...</span>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
                                <div className="flex items-start gap-3">
                                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                                  <div className="flex-1">
                                    <h4 className="font-semibold text-green-800 mb-2">Wallet Created Successfully!</h4>
                                    <div className="space-y-2 text-sm text-green-700">
                                      <p>• Email: {emailOnboarding.email}</p>
                                      <p>• New DiD: <span className="font-mono">{emailOnboarding.generatedDID}</span></p>
                                      <p>• Welcome email sent with setup instructions</p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="space-y-4">
                        <Label className="flex items-center gap-2">
                          <Tag className="h-4 w-4" />
                          Credential Type *
                        </Label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {credentialTypes.map((type) => (
                            <div
                              key={type.value}
                              onClick={() => setFormData(prev => ({ ...prev, type: type.value }))}
                              className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${
                                formData.type === type.value
                                  ? 'sui-border sui-bg-light shadow-md'
                                  : 'border-slate-200 hover:border-slate-300'
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <span className="text-2xl">{type.icon}</span>
                                <div className="flex-1">
                                  <h3 className="font-medium">{type.label}</h3>
                                  <p className="text-sm text-slate-600 mt-1">{type.description}</p>
                                </div>
                                {formData.type === type.value && (
                                  <CheckCircle className="h-5 w-5 sui-text" />
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {formData.type === 'custom' && (
                        <div className="space-y-2">
                          <Label htmlFor="customType">Custom Type Name *</Label>
                          <Input
                            id="customType"
                            value={formData.customType}
                            onChange={(e) => setFormData(prev => ({ ...prev, customType: e.target.value }))}
                            placeholder="e.g., CompanyEmployeeCredential"
                            className="h-12"
                          />
                        </div>
                      )}
                    </div>

                    <div className="flex justify-end pt-4">
                      <Button 
                        onClick={() => setCurrentStep(2)}
                        disabled={!isStepValid(1)}
                        className="sui-gradient text-white px-8"
                      >
                        Continue
                        <ChevronRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* Step 2: Details */}
                {currentStep === 2 && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-8 h-8 sui-gradient rounded-lg flex items-center justify-center">
                        <FileText className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold">Credential Details</h2>
                        <p className="text-slate-600">Configure scopes, expiration, and additional metadata</p>
                      </div>
                    </div>

                    <div className="col-span-full space-y-6">
                      <div className="space-y-4">
                        <Label className="flex items-center gap-2 text-lg">
                          <Sparkles className="h-5 w-5" />
                          Scopes & Permissions
                        </Label>
                        <p className="text-slate-600">
                          Select the permissions and access levels this credential will grant to the holder
                        </p>

                        {/* Selected Scopes Display */}
                        {scopeBuilder.selectedScopes.length > 0 && (
                          <div className="space-y-3">
                            <Label className="text-sm font-medium text-slate-700">Selected Scopes</Label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {scopeBuilder.selectedScopes.map((scope, index) => (
                                <div
                                  key={`${scope.category}-${index}`}
                                  className="flex items-center gap-3 p-4 bg-gradient-to-r from-white to-blue-50/30 rounded-lg border-2 border-blue-200 shadow-sm"
                                >
                                  <div className="flex items-center gap-3 flex-1">
                                    <div className={`w-10 h-10 ${scope.color} rounded-xl flex items-center justify-center text-white shadow-md`}>
                                      <span className="text-lg">{scope.icon}</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="font-semibold text-slate-800 capitalize">
                                        {scope.category}: {scope.permission}
                                      </div>
                                      <p className="text-sm text-slate-600 truncate">{scope.description}</p>
                                    </div>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeScope(scope.category)}
                                    className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Scope Categories */}
                        <div className="space-y-4">
                          <Label className="text-sm font-medium text-slate-700">Available Scope Categories</Label>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {scopeCategories.map((category) => {
                              const isSelected = scopeBuilder.selectedScopes.some(s => s.category === category.category);
                              return (
                                <Card 
                                  key={category.category} 
                                  className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                                    isSelected ? 'ring-2 ring-blue-500 shadow-md' : 'hover:shadow-md'
                                  }`}
                                >
                                  <CardContent className="p-4">
                                    <div className="flex items-start gap-3 mb-3">
                                      <div className={`w-8 h-8 ${category.color} rounded-lg flex items-center justify-center text-white`}>
                                        <span className="text-lg">{category.icon}</span>
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <h4 className="font-semibold text-slate-800">{category.label}</h4>
                                        <p className="text-xs text-slate-600 mt-1">{category.description}</p>
                                      </div>
                                    </div>
                                    
                                    <div className="space-y-2">
                                      <Label className="text-xs font-medium text-slate-600">Permission Levels</Label>
                                      <div className="grid gap-2">
                                        {category.permissions.map((permission) => (
                                          <Button
                                            key={permission.level}
                                            variant="outline"
                                            size="sm"
                                            onClick={() => addScope(category.category, permission.level)}
                                            className={`justify-start h-auto p-2 text-left ${
                                              scopeBuilder.selectedScopes.some(s => 
                                                s.category === category.category && s.permission === permission.level
                                              ) 
                                                ? 'bg-blue-50 border-blue-300 text-blue-700' 
                                                : 'hover:bg-slate-50'
                                            }`}
                                            disabled={isSelected && !scopeBuilder.selectedScopes.some(s => 
                                              s.category === category.category && s.permission === permission.level
                                            )}
                                          >
                                            <div className="w-full">
                                              <div className="font-medium text-sm">{permission.label}</div>
                                              <div className="text-xs text-slate-500 mt-1">{permission.description}</div>
                                            </div>
                                            {scopeBuilder.selectedScopes.some(s => 
                                              s.category === category.category && s.permission === permission.level
                                            ) && (
                                              <CheckCircle className="h-4 w-4 text-blue-600 ml-2 flex-shrink-0" />
                                            )}
                                          </Button>
                                        ))}
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              );
                            })}
                          </div>
                        </div>

                        {/* Custom Scope Builder */}
                        <div className="space-y-3">
                          <Button
                            variant="outline"
                            onClick={() => setScopeBuilder(prev => ({ ...prev, showCustomBuilder: !prev.showCustomBuilder }))}
                            className="sui-border flex items-center gap-2"
                          >
                            <Tag className="h-4 w-4" />
                            {scopeBuilder.showCustomBuilder ? 'Hide' : 'Add'} Custom Scope
                          </Button>
                          
                          {scopeBuilder.showCustomBuilder && (
                            <Card className="border-2 border-dashed border-blue-300 bg-blue-50/30">
                              <CardContent className="p-4 space-y-4">
                                <div className="flex items-center gap-2 mb-3">
                                  <div className="w-6 h-6 bg-gray-500 rounded-lg flex items-center justify-center text-white">
                                    <span className="text-sm">⚙️</span>
                                  </div>
                                  <Label className="font-semibold">Custom Scope Builder</Label>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <Label htmlFor="customCategory" className="text-sm">Category</Label>
                                    <Input
                                      id="customCategory"
                                      value={scopeBuilder.customScope.category}
                                      onChange={(e) => setScopeBuilder(prev => ({ 
                                        ...prev, 
                                        customScope: { ...prev.customScope, category: e.target.value } 
                                      }))}
                                      placeholder="e.g., custom, admin, special"
                                      className="mt-1"
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="customPermission" className="text-sm">Permission</Label>
                                    <Input
                                      id="customPermission"
                                      value={scopeBuilder.customScope.permission}
                                      onChange={(e) => setScopeBuilder(prev => ({ 
                                        ...prev, 
                                        customScope: { ...prev.customScope, permission: e.target.value } 
                                      }))}
                                      placeholder="e.g., advanced, special, custom"
                                      className="mt-1"
                                    />
                                  </div>
                                </div>
                                
                                <div>
                                  <Label htmlFor="customDescription" className="text-sm">Description</Label>
                                  <Input
                                    id="customDescription"
                                    value={scopeBuilder.customScope.description}
                                    onChange={(e) => setScopeBuilder(prev => ({ 
                                      ...prev, 
                                      customScope: { ...prev.customScope, description: e.target.value } 
                                    }))}
                                    placeholder="Brief description of this custom scope"
                                    className="mt-1"
                                  />
                                </div>
                                
                                <div className="flex gap-2 pt-2">
                                  <Button
                                    onClick={addCustomScope}
                                    disabled={!scopeBuilder.customScope.category || !scopeBuilder.customScope.permission}
                                    className="sui-gradient text-white"
                                    size="sm"
                                  >
                                    <Zap className="h-4 w-4 mr-2" />
                                    Add Custom Scope
                                  </Button>
                                  <Button
                                    variant="outline"
                                    onClick={() => setScopeBuilder(prev => ({ 
                                      ...prev, 
                                      customScope: { category: '', permission: '', description: '' },
                                      showCustomBuilder: false
                                    }))}
                                    size="sm"
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="expirationDate" className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          Expiration Date
                        </Label>
                        <Input
                          id="expirationDate"
                          type="date"
                          value={formData.expirationDate}
                          onChange={(e) => setFormData(prev => ({ ...prev, expirationDate: e.target.value }))}
                          min={new Date().toISOString().split('T')[0]}
                          className="h-12"
                        />
                        <p className="text-sm text-slate-500">
                          Leave empty for permanent credentials
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Brief description of this credential and its purpose"
                        rows={3}
                      />
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label className="flex items-center gap-2 mb-3">
                          <FileJson className="h-4 w-4" />
                          Additional Metadata (JSON)
                        </Label>
                        <p className="text-sm text-slate-500 mb-4">
                          Upload a JSON file or paste JSON content to be stored on IPFS and linked to the credential
                        </p>
                        
                        {/* Input Method Toggle */}
                        <div className="flex gap-2 mb-4">
                          <Button
                            type="button"
                            variant={jsonInputMethod === 'textarea' ? 'default' : 'outline'}
                            onClick={() => setJsonInputMethod('textarea')}
                            className={`flex-1 ${jsonInputMethod === 'textarea' ? 'sui-gradient text-white' : 'sui-border'}`}
                          >
                            <ClipboardPaste className="h-4 w-4 mr-2" />
                            Paste JSON
                          </Button>
                          <Button
                            type="button"
                            variant={jsonInputMethod === 'file' ? 'default' : 'outline'}
                            onClick={() => setJsonInputMethod('file')}
                            className={`flex-1 ${jsonInputMethod === 'file' ? 'sui-gradient text-white' : 'sui-border'}`}
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            Upload File
                          </Button>
                        </div>

                        {jsonInputMethod === 'textarea' ? (
                          <div className="space-y-3">
                            <Textarea
                              value={jsonInput}
                              onChange={(e) => setJsonInput(e.target.value)}
                              placeholder={`{
  "degree": "Computer Science",
  "university": "Stanford University",
  "gpa": 3.8,
  "graduationDate": "2024-05-15"
}`}
                              rows={8}
                              className={`font-mono text-sm ${!isValidJson(jsonInput) ? 'border-red-300' : ''}`}
                            />
                            {jsonInput && !isValidJson(jsonInput) && (
                              <p className="text-sm text-red-600 flex items-center gap-2">
                                <AlertCircle className="h-4 w-4" />
                                Invalid JSON format
                              </p>
                            )}
                            {jsonInput && isValidJson(jsonInput) && (
                              <Button 
                                onClick={handleJsonPaste}
                                variant="outline"
                                className="sui-border"
                              >
                                <ClipboardPaste className="h-4 w-4 mr-2" />
                                Apply JSON
                              </Button>
                            )}
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center">
                              <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                              <p className="text-sm text-slate-600 mb-2">
                                Drop your JSON file here or click to browse
                              </p>
                              <input
                                type="file"
                                accept=".json"
                                onChange={handleFileUpload}
                                className="hidden"
                                id="json-file-upload"
                              />
                              <Button 
                                variant="outline" 
                                onClick={() => document.getElementById('json-file-upload')?.click()}
                                className="sui-border"
                              >
                                Choose File
                              </Button>
                            </div>
                            {uploadedFileName && (
                              <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                                <FileJson className="h-4 w-4 text-green-600" />
                                <span className="text-sm text-green-700">{uploadedFileName}</span>
                                <CheckCircle className="h-4 w-4 text-green-600 ml-auto" />
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-between pt-4">
                      <Button 
                        onClick={() => setCurrentStep(1)}
                        variant="outline"
                        className="sui-border"
                      >
                        <ChevronLeft className="h-4 w-4 mr-2" />
                        Back
                      </Button>
                      <Button 
                        onClick={() => setCurrentStep(3)}
                        className="sui-gradient text-white px-8"
                      >
                        Continue
                        <ChevronRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* Step 3: Review */}
                {currentStep === 3 && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-8 h-8 sui-gradient rounded-lg flex items-center justify-center">
                        <Eye className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold">Review & Issue</h2>
                        <p className="text-slate-600">Verify all information before issuing the credential</p>
                      </div>
                    </div>

                    <div className="space-y-6">
                      {/* Credential Preview */}
                      <Card className="border-2 sui-border-light bg-gradient-to-br from-white to-blue-50/30">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5 sui-text" />
                            Credential Preview
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label className="text-sm font-medium text-slate-600">Type</Label>
                              <p className="font-medium">{formData.type === 'custom' ? formData.customType : getSelectedCredentialType()?.label}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium text-slate-600">Recipient</Label>
                              <p className="font-mono text-sm break-all">{formData.subject}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium text-slate-600">Issuer</Label>
                              <p className="font-medium">{user.username || 'Not specified'}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium text-slate-600">Expiration</Label>
                              <p className="font-medium">{formData.expirationDate || 'Never expires'}</p>
                            </div>
                          </div>
                          
                          {formData.description && (
                            <div>
                              <Label className="text-sm font-medium text-slate-600">Description</Label>
                              <p className="text-sm">{formData.description}</p>
                            </div>
                          )}

                          {scopeBuilder.selectedScopes.length > 0 && (
                            <div>
                              <Label className="text-sm font-medium text-slate-600">Scopes & Permissions</Label>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                                {scopeBuilder.selectedScopes.map((scope, index) => (
                                  <div
                                    key={`${scope.category}-${index}`}
                                    className="flex items-center gap-3 p-3 bg-gradient-to-r from-white to-blue-50/50 rounded-lg border border-blue-200"
                                  >
                                    <div className={`w-8 h-8 ${scope.color} rounded-lg flex items-center justify-center text-white`}>
                                      <span className="text-sm">{scope.icon}</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="font-medium text-sm text-slate-800 capitalize">
                                        {scope.category}: {scope.permission}
                                      </div>
                                      <p className="text-xs text-slate-600 truncate">{scope.description}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {formData.additionalFields && (
                            <div>
                              <Label className="text-sm font-medium text-slate-600">Additional Metadata</Label>
                              <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg mt-1">
                                <pre className="text-xs overflow-x-auto text-slate-700">
                                  {JSON.stringify(parseAdditionalFields(formData.additionalFields), null, 2)}
                                </pre>
                              </div>
                            </div>
                          )}

                          {emailOnboarding.created && (
                            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                              <div className="flex items-center gap-2 text-sm text-green-800">
                                <UserPlus className="h-4 w-4" />
                                <span className="font-medium">Email Onboarding:</span>
                                <span>{emailOnboarding.email}</span>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>

                      {/* Transaction Info */}
                      <Card className="border border-slate-200">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Zap className="h-5 w-5 text-blue-600" />
                            Transaction Information
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center p-3 bg-blue-50 rounded-lg">
                              <div className="text-lg font-bold text-blue-600">FREE</div>
                              <div className="text-xs text-blue-600">Gas Cost</div>
                            </div>
                            <div className="text-center p-3 bg-green-50 rounded-lg">
                              <div className="text-lg font-bold text-green-600">~2s</div>
                              <div className="text-xs text-green-600">Issuance Time</div>
                            </div>
                            <div className="text-center p-3 bg-orange-50 rounded-lg">
                              <div className="text-lg font-bold text-orange-600">Walrus</div>
                              <div className="text-xs text-orange-600">Metadata Storage</div>
                            </div>
                            <div className="text-center p-3 bg-purple-50 rounded-lg">
                              <div className="text-lg font-bold text-purple-600">SUI</div>
                              <div className="text-xs text-purple-600">Blockchain</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="flex justify-between pt-4">
                      <Button 
                        onClick={() => setCurrentStep(2)}
                        variant="outline"
                        disabled={isIssuing}
                        className="sui-border"
                      >
                        <ChevronLeft className="h-4 w-4 mr-2" />
                        Back
                      </Button>
                      <Button 
                        onClick={handleIssue}
                        disabled={isIssuing || !isStepValid(3)}
                        className="sui-gradient text-white px-8"
                      >
                        {isIssuing ? (
                          <>
                            <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                            Issuing Credential...
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4 mr-2" />
                            Issue Credential
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}