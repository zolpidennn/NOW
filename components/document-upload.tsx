"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Upload, FileText, CheckCircle, XCircle, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface DocumentUploadProps {
  companyId: string
  documentType: string
  label: string
  required?: boolean
  existingDocument?: {
    id: string
    file_url: string
    file_name: string
    verified: boolean
    rejection_reason?: string
  }
  onUploadSuccess?: () => void
}

export function DocumentUpload({
  companyId,
  documentType,
  label,
  required = false,
  existingDocument,
  onUploadSuccess
}: DocumentUploadProps) {
  const [uploading, setUploading] = useState(false)

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
    if (!allowedTypes.includes(file.type)) {
      alert('Tipo de arquivo não permitido. Use apenas imagens (JPG, PNG, WebP) ou PDF.')
      return
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('Arquivo muito grande. O tamanho máximo é 10MB.')
      return
    }

    setUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('companyId', companyId)
      formData.append('documentType', documentType)

      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()

      if (result.success) {
        alert('Documento enviado com sucesso!')
        onUploadSuccess?.()
      } else {
        alert('Erro ao enviar documento: ' + result.error)
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('Erro ao enviar documento. Tente novamente.')
    } finally {
      setUploading(false)
      // Reset input
      event.target.value = ''
    }
  }

  const getStatusBadge = () => {
    if (!existingDocument) return null

    if (existingDocument.verified) {
      return <Badge className="bg-green-100 text-green-800">
        <CheckCircle className="h-3 w-3 mr-1" />
        Verificado
      </Badge>
    }

    if (existingDocument.rejection_reason) {
      return <Badge className="bg-red-100 text-red-800">
        <XCircle className="h-3 w-3 mr-1" />
        Rejeitado
      </Badge>
    }

    return <Badge className="bg-yellow-100 text-yellow-800">
      Pendente
    </Badge>
  }

  return (
    <div className="flex items-center justify-between p-4 border rounded-lg">
      <div className="flex items-center gap-3">
        <FileText className="h-5 w-5 text-muted-foreground" />
        <div>
          <p className="font-medium">{label}</p>
          <p className="text-sm text-muted-foreground">
            {required ? 'Obrigatório' : 'Opcional'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {getStatusBadge()}

        {existingDocument ? (
          <Button
            size="sm"
            variant="outline"
            onClick={() => window.open(existingDocument.file_url, '_blank')}
          >
            Ver
          </Button>
        ) : (
          <div>
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={handleFileUpload}
              className="hidden"
              id={`upload-${documentType}`}
              disabled={uploading}
            />
            <label htmlFor={`upload-${documentType}`}>
              <Button size="sm" variant="outline" asChild disabled={uploading}>
                <span className="cursor-pointer">
                  {uploading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4 mr-2" />
                  )}
                  {uploading ? 'Enviando...' : 'Enviar'}
                </span>
              </Button>
            </label>
          </div>
        )}
      </div>
    </div>
  )
}