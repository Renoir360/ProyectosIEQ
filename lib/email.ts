export async function sendPurchaseEmail(
    purchase: {
        id: string
        title: string
        estimatedAmount: number
        justification: string
        project?: { name: string } | null
        rejectionComments?: string | null
    },
    type: 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED',
    recipientEmail: string,
    recipientName: string
) {
    const resendApiKey = process.env.RESEND_API_KEY
    if (!resendApiKey) {
        console.warn('Advertencia: RESEND_API_KEY no está configurada. Correo omitido.')
        return { success: false, message: 'Falta RESEND_API_KEY' }
    }

    let subject = ''
    let htmlContent = ''

    const formattedAmount = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'USD' }).format(purchase.estimatedAmount)

    if (type === 'PENDING_APPROVAL') {
        subject = `📢 Clínica IEQ: Compra Pendiente de Autorización - ${purchase.title}`
        htmlContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
                <h2 style="color: #1cb7be; margin-top: 0;">Solicitud de Compra Creada</h2>
                <p>Hola ${recipientName},</p>
                <p>Se ha generado una nueva solicitud de compra que requiere de tu revisión y autorización:</p>
                <div style="background-color: #f8fafc; border-left: 4px solid #1cb7be; padding: 15px; margin: 20px 0; border-radius: 4px;">
                    <p style="margin: 0 0 8px 0;"><strong>Ítem:</strong> ${purchase.title}</p>
                    <p style="margin: 0 0 8px 0;"><strong>Monto Estimado:</strong> ${formattedAmount}</p>
                    <p style="margin: 0 0 8px 0;"><strong>Justificación:</strong> ${purchase.justification}</p>
                    <p style="margin: 0;"><strong>Proyecto:</strong> ${purchase.project?.name || 'Global'}</p>
                </div>
                <p>Por favor ingresa a la plataforma para autorizar o rechazar esta solicitud:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="https://proyectos-ieq.vercel.app/compras" style="background-color: #1cb7be; color: #ffffff; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 8px; display: inline-block;">Ver Compras Pendientes</a>
                </div>
                <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 30px 0;" />
                <p style="font-size: 11px; color: #94a3b8; text-align: center; margin: 0;">Departamento de Sistemas · Clínica IEQ</p>
            </div>
        `
    } else if (type === 'APPROVED') {
        subject = `✅ Clínica IEQ: Compra APROBADA - ${purchase.title}`
        htmlContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
                <h2 style="color: #10b981; margin-top: 0;">Solicitud de Compra Aprobada</h2>
                <p>Hola ${recipientName},</p>
                <p>Presidencia ha **aprobado** tu solicitud de compra:</p>
                <div style="background-color: #f0fdf4; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; border-radius: 4px;">
                    <p style="margin: 0 0 8px 0;"><strong>Ítem:</strong> ${purchase.title}</p>
                    <p style="margin: 0 0 8px 0;"><strong>Monto Autorizado:</strong> ${formattedAmount}</p>
                    <p style="margin: 0;"><strong>Proyecto:</strong> ${purchase.project?.name || 'Global'}</p>
                </div>
                <p>Ya puedes proceder con la gestión logística y actualizar el estado a "Comprado" en la plataforma cuando corresponda.</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="https://proyectos-ieq.vercel.app/compras" style="background-color: #10b981; color: #ffffff; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 8px; display: inline-block;">Ir a Bandeja de Compras</a>
                </div>
                <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 30px 0;" />
                <p style="font-size: 11px; color: #94a3b8; text-align: center; margin: 0;">Departamento de Sistemas · Clínica IEQ</p>
            </div>
        `
    } else if (type === 'REJECTED') {
        subject = `❌ Clínica IEQ: Compra RECHAZADA - ${purchase.title}`
        htmlContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
                <h2 style="color: #ef4444; margin-top: 0;">Solicitud de Compra Rechazada</h2>
                <p>Hola ${recipientName},</p>
                <p>Presidencia ha **rechazado** tu solicitud de compra:</p>
                <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; border-radius: 4px;">
                    <p style="margin: 0 0 8px 0;"><strong>Ítem:</strong> ${purchase.title}</p>
                    <p style="margin: 0 0 8px 0;"><strong>Monto Estimado:</strong> ${formattedAmount}</p>
                    <p style="margin: 0 0 8px 0;"><strong>Proyecto:</strong> ${purchase.project?.name || 'Global'}</p>
                    <p style="margin: 0;"><strong>Comentarios de Presidencia:</strong> <span style="color: #b91c1c;">${purchase.rejectionComments || 'No especificados'}</span></p>
                </div>
                <p>Revisa las razones del rechazo en la plataforma para realizar los ajustes necesarios.</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="https://proyectos-ieq.vercel.app/compras" style="background-color: #ef4444; color: #ffffff; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 8px; display: inline-block;">Ver Detalles de Compra</a>
                </div>
                <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 30px 0;" />
                <p style="font-size: 11px; color: #94a3b8; text-align: center; margin: 0;">Departamento de Sistemas · Clínica IEQ</p>
            </div>
        `
    }

    try {
        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${resendApiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                from: 'Clinica IEQ WorkCenter <onboarding@resend.dev>',
                to: recipientEmail,
                subject: subject,
                html: htmlContent
            })
        })

        const resData = await response.json()
        if (!response.ok) {
            console.error('Error al enviar correo mediante Resend:', resData)
            return { success: false, error: resData }
        }
        return { success: true, data: resData }
    } catch (error) {
        console.error('Excepción al enviar correo:', error)
        return { success: false, error }
    }
}
