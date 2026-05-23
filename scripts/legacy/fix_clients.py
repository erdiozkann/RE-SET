with open('src/pages/admin/components/ClientsTab.tsx', 'r') as f:
    lines = f.readlines()

new_lines = lines[:668] + [
    "      {/* Modals extracted to components */}\n",
    "      <ClientDetailModal\n",
    "        isOpen={showDetailModal}\n",
    "        onClose={() => setShowDetailModal(false)}\n",
    "        client={selectedClient}\n",
    "        invoices={clientInvoices}\n",
    "        payments={clientPayments}\n",
    "        appointments={clientAppointments}\n",
    "        onAddInvoice={() => setShowInvoiceModal(true)}\n",
    "        onAddPayment={() => setShowPaymentModal(true)}\n",
    "        onEditClient={handleEditClient}\n",
    "      />\n\n",
    "      <InvoiceModal\n",
    "        isOpen={showInvoiceModal}\n",
    "        onClose={() => setShowInvoiceModal(false)}\n",
    "        client={selectedClient}\n",
    "        invoiceForm={invoiceForm}\n",
    "        setInvoiceForm={setInvoiceForm}\n",
    "        onSave={handleAddInvoice}\n",
    "        saving={saving}\n",
    "      />\n\n",
    "      <PaymentModal\n",
    "        isOpen={showPaymentModal}\n",
    "        onClose={() => setShowPaymentModal(false)}\n",
    "        client={selectedClient}\n",
    "        invoices={clientInvoices}\n",
    "        paymentForm={paymentForm as any}\n",
    "        setPaymentForm={setPaymentForm}\n",
    "        onSave={handleAddPayment}\n",
    "        saving={saving}\n",
    "      />\n\n",
    "      <DeleteConfirmModal\n",
    "        isOpen={showDeleteConfirm}\n",
    "        onClose={() => { setShowDeleteConfirm(false); setSelectedClient(null); }}\n",
    "        client={selectedClient}\n",
    "        onConfirm={handleDeleteClient}\n",
    "        saving={saving}\n",
    "      />\n"
] + lines[1184:]

with open('src/pages/admin/components/ClientsTab.tsx', 'w') as f:
    f.writelines(new_lines)
