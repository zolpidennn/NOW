"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { DocumentUpload } from "@/components/document-upload"
import {
  Building2,
  Upload,
  CheckCircle,
  XCircle,
  Users,
  FileText,
  Camera,
  Shield,
  Plus,
  Edit,
  Trash2,
  UserPlus,
  Mail,
  Phone,
  MapPin,
  Calendar,
  AlertTriangle
} from "lucide-react"

type ServiceProvider = {
  id: string
  company_name: string
  contact_name: string | null
  email: string
  phone: string
  address: string
  service_categories: string[] | null
  description: string | null
  is_active: boolean
  rating: number
  total_services: number
  provider_type?: string
  verification_status?: string
  cnpj?: string | null
  cnpj_verified?: boolean
  cnpj_verification_date?: string
  street?: string
  number?: string
  complement?: string
  neighborhood?: string
  city?: string
  state?: string
  zip_code?: string
}

type CompanyDocument = {
  id: string
  document_type: string
  file_url: string
  file_name: string
  uploaded_at: string
  verified: boolean
  verified_by?: string
  verified_at?: string
  rejection_reason?: string
}

type CompanyAdmin = {
  id: string
  user_id: string | null
  user_email: string
  permission_level: 'master' | 'staff' | 'simple'
  is_active: boolean
  invited_at: string
  accepted_at?: string
  user_name?: string
}

const documentTypes = [
  { value: 'cnpj_card', label: 'Cartão CNPJ', required: true },
  { value: 'social_contract', label: 'Contrato Social', required: true },
  { value: 'proof_of_address', label: 'Comprovante de Endereço', required: true },
  { value: 'tax_certificate', label: 'Certificado de Regularidade Fiscal', required: false },
  { value: 'biometric_photo', label: 'Foto Biométrica', required: true }
]

const permissionLevels = [
  { value: 'master', label: 'NOW Master', description: 'Controle total da empresa' },
  { value: 'staff', label: 'NOW Staff', description: 'Permissões intermediárias' },
  { value: 'simple', label: 'NOW Simple', description: 'Permissões básicas' }
]

export default function CompanyDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const companyId = params.id as string

  const [company, setCompany] = useState<ServiceProvider | null>(null)
  const [documents, setDocuments] = useState<CompanyDocument[]>([])
  const [admins, setAdmins] = useState<CompanyAdmin[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("details")
  const [tableNotFound, setTableNotFound] = useState(false)
  const [creatingTable, setCreatingTable] = useState(false)

  // Form states
  const [showInviteDialog, setShowInviteDialog] = useState(false)
  const [inviteEmail, setInviteEmail] = useState("")
  const [invitePermission, setInvitePermission] = useState<'master' | 'staff' | 'simple'>('simple')

  useEffect(() => {
    checkAuth()
    loadCompanyData()
    checkAndCreateTable()
  }, [companyId])

  const checkAndCreateTable = async () => {
    try {
      const response = await fetch('/api/migrate-company-admins')
      const data = await response.json()
      
      if (data.status === 'missing') {
        console.log('Table not found, attempting to create...')
        setTableNotFound(true)
        
        // Attempt to create the table
        const createResponse = await fetch('/api/migrate-company-admins', {
          method: 'POST'
        })
        
        const createData = await createResponse.json()
        
        if (createData.success) {
          console.log('Table created successfully')
          setTableNotFound(false)
          setCreatingTable(false)
        } else {
          console.error('Failed to create table:', createData.error)
          setTableNotFound(true)
        }
      }
    } catch (error) {
      console.error('Error checking table:', error)
    }
  }

  const checkAuth = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || user.email !== "leonardo@oliport.com.br") {
      router.push("/")
      return
    }
  }

  const loadCompanyData = async () => {
    setLoading(true)
    const supabase = createClient()

    // Load company details
    const { data: companyData, error: companyError } = await supabase
      .from("service_providers")
      .select("*")
      .eq("id", companyId)
      .single()

    if (companyError) {
      console.error("Error loading company:", companyError)
      alert("Erro ao carregar empresa")
      return
    }

    setCompany(companyData)

    // Load documents (if table exists)
    try {
      const { data: documentsData } = await supabase
        .from("company_documents")
        .select("*")
        .eq("company_id", companyId)
        .order("uploaded_at", { ascending: false })

      setDocuments(documentsData || [])
    } catch (error) {
      console.log("Documents table not available yet")
    }

    // Load admins (if table exists)
    try {
      const { data: adminsData } = await supabase
        .from("company_admins")
        .select("*")
        .eq("company_id", companyId)
        .order("invited_at", { ascending: false })

      // Enrich admin data with user names if they exist
      const enrichedAdmins = await Promise.all(
        (adminsData || []).map(async (admin: any) => {
          if (admin.user_id) {
            try {
              const { data: profile } = await supabase
                .from('profiles')
                .select('full_name')
                .eq('id', admin.user_id)
                .single()
              
              return {
                ...admin,
                user_name: profile?.full_name
              }
            } catch (err) {
              return admin
            }
          }
          return admin
        })
      )

      setAdmins(enrichedAdmins || [])
    } catch (error) {
      console.log("Company admins table not available yet")
    }

    setLoading(false)
  }

  const handleInviteAdmin = async () => {
    if (!inviteEmail.trim()) {
      alert("Por favor, insira um email válido")
      return
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(inviteEmail)) {
      alert("Por favor, insira um email válido")
      return
    }

    // Check if table exists first
    if (tableNotFound) {
      alert("A tabela de administradores está sendo criada. Por favor, tente novamente em alguns segundos.")
      return
    }

    const supabase = createClient()

    try {
      // Check if already invited
      const { data: existingInvite, error: checkError } = await supabase
        .from('company_admins')
        .select('id')
        .eq('company_id', companyId)
        .eq('user_email', inviteEmail.toLowerCase())
        .single()

      // Handle table not found error
      if (checkError && checkError.code === 'PGRST205') {
        console.log('Table not found, creating...')
        setTableNotFound(true)
        setCreatingTable(true)
        
        // Attempt to create the table
        const createResponse = await fetch('/api/migrate-company-admins', {
          method: 'POST'
        })
        
        const createData = await createResponse.json()
        
        if (createData.success) {
          setTableNotFound(false)
          setCreatingTable(false)
          alert("Sistema inicializado. Por favor, tente adicionar o usuário novamente.")
          return
        } else {
          setCreatingTable(false)
          alert(
            "❌ Erro: Sistema de gerenciamento não inicializado\n\n" +
            "A tabela 'company_admins' não existe no banco de dados.\n\n" +
            "Para ativar este recurso:\n" +
            "1. Vá para app.supabase.com\n" +
            "2. Abra SQL Editor → New Query\n" +
            "3. Execute o arquivo:\n   scripts/027_create_company_admin_tables.sql\n\n" +
            "Após executar, recarregue esta página."
          )
          setTableNotFound(true)
          return
        }
      }

      if (existingInvite) {
        alert("Este email já foi adicionado para esta empresa.")
        return
      }

      // Get current user ID
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      if (!currentUser) {
        alert("Erro ao obter usuário atual")
        return
      }

      // Try to find existing user by email
      let userId = null
      const { data: userData } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', inviteEmail.toLowerCase())
        .single()

      if (userData) {
        userId = userData.id
      }

      // Add to company_admins (whether user exists or not)
      try {
        const { error: inviteError } = await supabase
          .from('company_admins')
          .insert([{
            company_id: companyId,
            user_id: userId, // Can be null if user doesn't exist yet
            user_email: inviteEmail.toLowerCase(),
            permission_level: invitePermission,
            invited_by: currentUser.id,
            invited_at: new Date().toISOString()
          }])

        if (inviteError) {
          console.error("Invite error:", inviteError)
          
          // If table not found, try to create it
          if (inviteError.code === 'PGRST205') {
            setTableNotFound(true)
            setCreatingTable(true)
            
            const createResponse = await fetch('/api/migrate-company-admins', {
              method: 'POST'
            })
            
            const createData = await createResponse.json()
            
            if (createData.success) {
              setTableNotFound(false)
              setCreatingTable(false)
              alert("Sistema inicializado. Por favor, tente adicionar o usuário novamente.")
              return
            } else {
              setCreatingTable(false)
              alert(
                "❌ Erro: Sistema de gerenciamento não inicializado\n\n" +
                "A tabela 'company_admins' não existe no banco de dados.\n\n" +
                "Para ativar este recurso:\n" +
                "1. Vá para app.supabase.com\n" +
                "2. Abra SQL Editor → New Query\n" +
                "3. Execute o arquivo:\n   scripts/027_create_company_admin_tables.sql\n\n" +
                "Após executar, recarregue esta página."
              )
              setTableNotFound(true)
              return
            }
          }
          
          alert("Erro ao adicionar usuário")
          return
        }

        alert(userId 
          ? "Usuário adicionado com sucesso! Ele terá acesso ao dashboard imediatamente."
          : "Email adicionado com sucesso! Quando o usuário se cadastrar, terá acesso automático ao dashboard."
        )
        setShowInviteDialog(false)
        setInviteEmail("")
        setInvitePermission('simple')
        loadCompanyData()
      } catch (tableError) {
        console.error("Company admins table error:", tableError)
        alert("Sistema de gerenciamento de usuários ainda não está disponível. Entre em contato com o administrador.")
      }
    } catch (error) {
      console.error("Invite error:", error)
      alert("Erro ao adicionar usuário")
    }
  }

  const verifyDocument = async (documentId: string, verified: boolean, rejectionReason?: string) => {
    const supabase = createClient()

    try {
      const updateData: any = {
        verified,
        verified_at: verified ? new Date().toISOString() : null,
        verified_by: (await supabase.auth.getUser()).data.user?.id
      }

      if (!verified && rejectionReason) {
        updateData.rejection_reason = rejectionReason
      }

      const { error } = await supabase
        .from('company_documents')
        .update(updateData)
        .eq('id', documentId)

      if (error) {
        console.error("Verification error:", error)
        alert("Erro ao verificar documento")
        return
      }

      alert(verified ? "Documento verificado com sucesso!" : "Documento rejeitado")
      loadCompanyData()
    } catch (error) {
      console.error("Verification error:", error)
      alert("Erro ao verificar documento")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  if (!company) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold mb-4">Empresa não encontrada</h1>
          <Button onClick={() => router.push('/admin/dashboard/companies')}>
            Voltar para Empresas
          </Button>
        </div>
      </div>
    )
  }

  const getDocumentStatus = (doc: CompanyDocument) => {
    if (doc.verified) return { status: 'verified', label: 'Verificado', color: 'bg-green-100 text-green-800' }
    if (doc.rejection_reason) return { status: 'rejected', label: 'Rejeitado', color: 'bg-red-100 text-red-800' }
    return { status: 'pending', label: 'Pendente', color: 'bg-yellow-100 text-yellow-800' }
  }

  const getVerificationProgress = () => {
    const requiredDocs = documentTypes.filter(doc => doc.required)
    const verifiedDocs = documents.filter(doc => doc.verified && requiredDocs.some(req => req.value === doc.document_type))
    return Math.round((verifiedDocs.length / requiredDocs.length) * 100)
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Button
              variant="outline"
              onClick={() => router.push('/admin/dashboard/companies')}
              className="mb-4"
            >
              ← Voltar para Empresas
            </Button>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Building2 className="h-8 w-8" />
              {company.company_name}
            </h1>
            <p className="text-muted-foreground">Gerenciar empresa e documentação</p>
          </div>
          <div className="flex gap-2">
            <Badge variant={company.is_active ? "default" : "secondary"}>
              {company.is_active ? "Ativa" : "Inativa"}
            </Badge>
            {company.cnpj_verified && (
              <Badge className="bg-green-100 text-green-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                CNPJ Verificado
              </Badge>
            )}
          </div>
        </div>

        {/* Verification Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Status de Verificação
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Progresso da Verificação</span>
                <span className="font-semibold">{getVerificationProgress()}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${getVerificationProgress()}%` }}
                ></div>
              </div>
              <p className="text-sm text-muted-foreground">
                {getVerificationProgress() === 100
                  ? "Todos os documentos obrigatórios foram verificados!"
                  : "Aguarde a verificação dos documentos obrigatórios para liberar a empresa."
                }
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="details">Detalhes</TabsTrigger>
            <TabsTrigger value="documents">Documentos</TabsTrigger>
            <TabsTrigger value="admins">Administradores</TabsTrigger>
            <TabsTrigger value="verification">Verificação</TabsTrigger>
          </TabsList>

          {/* Company Details Tab */}
          <TabsContent value="details" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informações da Empresa</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Nome da Empresa</Label>
                    <p className="text-sm font-medium">{company.company_name}</p>
                  </div>
                  <div>
                    <Label>CNPJ</Label>
                    <p className="text-sm font-medium">{company.cnpj || 'Não informado'}</p>
                  </div>
                  <div>
                    <Label>Email</Label>
                    <p className="text-sm font-medium flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      {company.email}
                    </p>
                  </div>
                  <div>
                    <Label>Telefone</Label>
                    <p className="text-sm font-medium flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      {company.phone}
                    </p>
                  </div>
                  <div className="md:col-span-2">
                    <Label>Endereço</Label>
                    <p className="text-sm font-medium flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {company.address}
                    </p>
                  </div>
                  {company.service_categories && company.service_categories.length > 0 && (
                    <div className="md:col-span-2">
                      <Label>Categorias de Serviço</Label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {company.service_categories.map((category) => (
                          <Badge key={category} variant="outline">
                            {category}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {company.description && (
                    <div className="md:col-span-2">
                      <Label>Descrição</Label>
                      <p className="text-sm">{company.description}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Documentos da Empresa
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {documentTypes.map((docType) => {
                    const existingDoc = documents.find(doc => doc.document_type === docType.value)

                    return (
                      <DocumentUpload
                        key={docType.value}
                        companyId={companyId}
                        documentType={docType.value}
                        label={docType.label}
                        required={docType.required}
                        existingDocument={existingDoc}
                        onUploadSuccess={loadCompanyData}
                      />
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Admins Tab */}
          <TabsContent value="admins" className="space-y-6">
      {tableNotFound && (
              <Alert className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-800 dark:text-yellow-200">
                  <strong>⚠️ Sistema de Gerenciamento de Usuários Não Inicializado</strong>
                  <div className="mt-3 space-y-2">
                    <p>A tabela de administradores da empresa ainda não foi criada no banco de dados.</p>
                    <p className="font-semibold">Para ativar este recurso, execute:</p>
                    <div className="bg-yellow-100 dark:bg-yellow-900 p-2 rounded text-sm font-mono">
                      scripts/027_create_company_admin_tables.sql
                    </div>
                    <p className="text-sm">no Supabase SQL Editor:</p>
                    <ol className="list-decimal list-inside text-sm space-y-1 ml-2">
                      <li>Vá para <a href="https://app.supabase.com" target="_blank" rel="noopener noreferrer" className="underline">app.supabase.com</a></li>
                      <li>Abra <strong>SQL Editor</strong></li>
                      <li>Crie uma <strong>New Query</strong></li>
                      <li>Copie e cole o arquivo SQL</li>
                      <li>Clique em <strong>Run</strong></li>
                    </ol>
                    <p className="text-xs mt-2 text-gray-600 dark:text-gray-400">Após executar, recarregue esta página</p>
                  </div>
                </AlertDescription>
              </Alert>
            )}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Administradores da Empresa
                  </span>
                  <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
                    <DialogTrigger asChild>
                      <Button disabled={tableNotFound || creatingTable}>
                        <UserPlus className="h-4 w-4 mr-2" />
                        {creatingTable ? "Inicializando..." : "Adicionar Usuário"}
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Adicionar Usuário à Empresa</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <Alert>
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>
                            O usuário receberá acesso ao dashboard assim que for adicionado. Se ele já tiver cadastro, acessará imediatamente. Caso contrário, terá acesso automático após se cadastrar.
                          </AlertDescription>
                        </Alert>
                        <div>
                          <Label htmlFor="invite-email">Email do usuário</Label>
                          <Input
                            id="invite-email"
                            type="email"
                            value={inviteEmail}
                            onChange={(e) => setInviteEmail(e.target.value)}
                            placeholder="usuario@email.com"
                          />
                        </div>
                        <div>
                          <Label htmlFor="permission-level">Nível de permissão</Label>
                          <select
                            id="permission-level"
                            value={invitePermission}
                            onChange={(e) => setInvitePermission(e.target.value as any)}
                            className="w-full p-2 border rounded-md"
                          >
                            {permissionLevels.map((level) => (
                              <option key={level.value} value={level.value}>
                                {level.label} - {level.description}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="flex gap-2">
                          <Button onClick={handleInviteAdmin} className="flex-1">
                            Adicionar Usuário
                          </Button>
                          <Button variant="outline" onClick={() => setShowInviteDialog(false)}>
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {admins.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-lg font-semibold mb-2">Nenhum administrador</p>
                    <p className="text-sm text-muted-foreground">
                      Convide usuários para administrar esta empresa
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {admins.map((admin) => (
                      <div key={admin.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900">
                        <div className="flex items-center gap-3 flex-1">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                            <Users className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-medium">
                              {admin.user_name ? (
                                <>
                                  {admin.user_name}
                                  {!admin.user_id && <span className="text-xs text-yellow-600 ml-2">(Cadastro Pendente)</span>}
                                </>
                              ) : (
                                <>
                                  {admin.user_email}
                                  {!admin.user_id && <span className="text-xs text-yellow-600 ml-2">(Cadastro Pendente)</span>}
                                </>
                              )}
                            </p>
                            <p className="text-sm text-muted-foreground">{admin.user_email}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Adicionado em: {new Date(admin.invited_at).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">
                            {permissionLevels.find(p => p.value === admin.permission_level)?.label}
                          </Badge>
                          <Badge variant={admin.is_active ? "default" : "secondary"}>
                            {admin.is_active ? "Ativo" : "Inativo"}
                          </Badge>
                          {admin.user_id && !admin.accepted_at && (
                            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                              Pendente
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Verification Tab */}
          <TabsContent value="verification" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Verificação de Documentos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {documents.length === 0 ? (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-lg font-semibold mb-2">Nenhum documento enviado</p>
                      <p className="text-sm text-muted-foreground">
                        Os documentos aparecerão aqui após serem enviados
                      </p>
                    </div>
                  ) : (
                    documents.map((doc) => {
                      const status = getDocumentStatus(doc)
                      const docType = documentTypes.find(dt => dt.value === doc.document_type)

                      return (
                        <div key={doc.id} className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <FileText className="h-5 w-5" />
                              <span className="font-medium">{docType?.label || doc.document_type}</span>
                              <Badge className={status.color}>
                                {status.label}
                              </Badge>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => window.open(doc.file_url, '_blank')}
                            >
                              Ver Documento
                            </Button>
                          </div>

                          <div className="text-sm text-muted-foreground space-y-1">
                            <p>Enviado em: {new Date(doc.uploaded_at).toLocaleDateString('pt-BR')}</p>
                            {doc.verified_at && (
                              <p>Verificado em: {new Date(doc.verified_at).toLocaleDateString('pt-BR')}</p>
                            )}
                            {doc.rejection_reason && (
                              <Alert className="mt-2">
                                <AlertTriangle className="h-4 w-4" />
                                <AlertDescription>
                                  <strong>Motivo da rejeição:</strong> {doc.rejection_reason}
                                </AlertDescription>
                              </Alert>
                            )}
                          </div>

                          {!doc.verified && !doc.rejection_reason && (
                            <div className="flex gap-2 mt-4">
                              <Button
                                size="sm"
                                onClick={() => verifyDocument(doc.id, true)}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Aprovar
                              </Button>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button size="sm" variant="destructive">
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Rejeitar
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Rejeitar Documento</DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <div>
                                      <Label>Motivo da rejeição</Label>
                                      <Textarea
                                        placeholder="Explique o motivo da rejeição..."
                                        id={`rejection-${doc.id}`}
                                      />
                                    </div>
                                    <div className="flex gap-2">
                                      <Button
                                        onClick={() => {
                                          const reason = (document.getElementById(`rejection-${doc.id}`) as HTMLTextAreaElement)?.value
                                          if (reason) {
                                            verifyDocument(doc.id, false, reason)
                                          }
                                        }}
                                      >
                                        Confirmar Rejeição
                                      </Button>
                                      <Button variant="outline">
                                        Cancelar
                                      </Button>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            </div>
                          )}
                        </div>
                      )
                    })
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}