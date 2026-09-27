import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    fontSize: 11,
    color: '#1f2937',
    backgroundColor: '#ffffff',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 40,
  },
  headerLeft: {
    flexDirection: 'column',
    width: '50%',
  },
  headerRight: {
    flexDirection: 'column',
    width: '50%',
    alignItems: 'flex-end',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  orgName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#111827',
  },
  companyInfo: {
    fontSize: 10,
    color: '#4b5563',
    marginBottom: 2,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#374151',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingBottom: 4,
    marginBottom: 8,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  billTo: {
    width: '50%',
  },
  invoiceDetails: {
    width: '40%',
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  detailLabel: {
    color: '#6b7280',
    fontWeight: 'bold',
  },
  detailValue: {
    color: '#111827',
  },
  table: {
    width: '100%',
    marginBottom: 30,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f9fafb',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  tableHeaderCell: {
    fontWeight: 'bold',
    color: '#374151',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  col1: { width: '40%' },
  col2: { width: '20%', textAlign: 'center' },
  col3: { width: '20%', textAlign: 'right' },
  col4: { width: '20%', textAlign: 'right' },
  summarySection: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  summaryBox: {
    width: '40%',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  grandTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderTopWidth: 2,
    borderTopColor: '#e5e7eb',
    marginTop: 4,
  },
  grandTotalText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111827',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    color: '#9ca3af',
    fontSize: 9,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 10,
  }
});

interface InvoicePDFProps {
  sale: any;
}

export const InvoicePDF: React.FC<InvoicePDFProps> = ({ sale }) => {
  if (!sale) return null;

  const invoiceNumber = sale.receipts?.[0]?.receiptNumber || sale.id.slice(0, 8);
  const organizationName = sale.branch?.organization?.name || 'Store Name';
  const branchName = sale.branch?.name;
  const branchAddress = sale.branch?.address;
  const branchPhone = sale.branch?.phone;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        
        {/* Header */}
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <Text style={styles.orgName}>{organizationName}</Text>
            {branchName && <Text style={styles.companyInfo}>{branchName}</Text>}
            {branchAddress && <Text style={styles.companyInfo}>{branchAddress}</Text>}
            {branchPhone && <Text style={styles.companyInfo}>{branchPhone}</Text>}
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.title}>INVOICE</Text>
            <Text style={styles.companyInfo}>#{invoiceNumber}</Text>
          </View>
        </View>

        {/* Details Section */}
        <View style={styles.detailsRow}>
          <View style={styles.billTo}>
            <Text style={styles.sectionTitle}>Bill To</Text>
            {sale.customer ? (
              <>
                <Text style={{ fontWeight: 'bold', marginBottom: 2 }}>{sale.customer.name}</Text>
                {sale.customer.email && <Text style={styles.companyInfo}>{sale.customer.email}</Text>}
                {sale.customer.phone && <Text style={styles.companyInfo}>{sale.customer.phone}</Text>}
                {sale.customer.address && <Text style={styles.companyInfo}>{sale.customer.address}</Text>}
              </>
            ) : (
              <Text style={styles.companyInfo}>Walk-in Customer</Text>
            )}
          </View>
          
          <View style={styles.invoiceDetails}>
            <Text style={styles.sectionTitle}>Invoice Details</Text>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Invoice Date:</Text>
              <Text style={styles.detailValue}>{new Date(sale.createdAt).toLocaleDateString()}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Payment Status:</Text>
              <Text style={styles.detailValue}>{sale.status}</Text>
            </View>
          </View>
        </View>

        {/* Items Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.col1, styles.tableHeaderCell]}>Description</Text>
            <Text style={[styles.col2, styles.tableHeaderCell]}>Quantity</Text>
            <Text style={[styles.col3, styles.tableHeaderCell]}>Unit Price</Text>
            <Text style={[styles.col4, styles.tableHeaderCell]}>Amount</Text>
          </View>

          {sale.items?.map((item: any, idx: number) => {
            const variantName = item.productVariant?.name !== 'Default' ? ` - ₹{item.productVariant?.name}` : '';
            const name = `${item.productVariant?.product?.name || 'Item'}${variantName}`;
            return (
              <React.Fragment key={idx}>
                <View style={styles.tableRow}>
                  <Text style={styles.col1}>{name}</Text>
                  <Text style={styles.col2}>{item.quantity}</Text>
                  <Text style={styles.col3}>₹{Number(item.unitPrice).toFixed(2)}</Text>
                  <Text style={styles.col4}>₹{Number(item.subtotal).toFixed(2)}</Text>
                </View>
              </React.Fragment>
            );
          })}
        </View>

        {/* Summary */}
        <View style={styles.summarySection}>
          <View style={styles.summaryBox}>
            <View style={styles.summaryRow}>
              <Text style={styles.detailLabel}>Subtotal</Text>
              <Text>₹{Number(sale.subtotal).toFixed(2)}</Text>
            </View>

            {sale.taxBreakdown && Array.isArray(sale.taxBreakdown) ? (
              sale.taxBreakdown.map((tax: any, idx: number) => (
                <React.Fragment key={`tax-${idx}`}>
                  <View style={styles.summaryRow}>
                    <Text style={styles.detailLabel}>{tax.name} {tax.type === 'PERCENTAGE' ? `(${tax.value}%)` : ''}</Text>
                    <Text>₹{Number(tax.amountCalculated).toFixed(2)}</Text>
                  </View>
                </React.Fragment>
              ))
            ) : (
              <View style={styles.summaryRow}>
                <Text style={styles.detailLabel}>Taxes</Text>
                <Text>₹{Number(sale.taxAmount).toFixed(2)}</Text>
              </View>
            )}

            {Number(sale.discountAmount) > 0 && (
              <View style={styles.summaryRow}>
                <Text style={styles.detailLabel}>Discount</Text>
                <Text>-₹{Number(sale.discountAmount).toFixed(2)}</Text>
              </View>
            )}

            <View style={styles.grandTotalRow}>
              <Text style={styles.grandTotalText}>Total</Text>
              <Text style={styles.grandTotalText}>₹{Number(sale.grandTotal).toFixed(2)}</Text>
            </View>
            
            <View style={{ marginTop: 10 }}>
              <Text style={[styles.detailLabel, { marginBottom: 4 }]}>Payments Made</Text>
              {sale.payments?.map((payment: any, idx: number) => (
                <React.Fragment key={`pay-${idx}`}>
                  <View style={styles.summaryRow}>
                    <Text style={{ fontSize: 9, color: '#6b7280' }}>{payment.method} ({new Date(payment.createdAt).toLocaleDateString()})</Text>
                    <Text style={{ fontSize: 9 }}>₹{Number(payment.amount).toFixed(2)}</Text>
                  </View>
                </React.Fragment>
              ))}
            </View>

          </View>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          Thank you for your business. For any inquiries about this invoice, please contact us.
        </Text>
      </Page>
    </Document>
  );
};

export default InvoicePDF;
