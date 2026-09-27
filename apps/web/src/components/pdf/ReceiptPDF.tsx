import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

// Define thermal receipt styles
const styles = StyleSheet.create({
  page: {
    padding: 15,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#000',
    backgroundColor: '#fff',
  },
  header: {
    alignItems: 'center',
    marginBottom: 10,
  },
  orgName: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 2,
    textAlign: 'center',
  },
  branchName: {
    fontSize: 10,
    marginBottom: 2,
    textAlign: 'center',
  },
  branchAddress: {
    fontSize: 9,
    textAlign: 'center',
    color: '#333',
    marginBottom: 8,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    borderBottomStyle: 'dashed',
    marginVertical: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  textBold: {
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 6,
    marginTop: 6,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  itemName: {
    width: '60%',
  },
  itemQty: {
    width: '15%',
    textAlign: 'center',
  },
  itemTotal: {
    width: '25%',
    textAlign: 'right',
  },
  totalsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  grandTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#000',
    borderTopStyle: 'dashed',
  },
  grandTotalText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  footer: {
    marginTop: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 9,
    textAlign: 'center',
    marginBottom: 2,
  }
});

interface ReceiptPDFProps {
  sale: any;
}

export const ReceiptPDF: React.FC<ReceiptPDFProps> = ({ sale }) => {
  if (!sale) return null;

  const receiptNumber = sale.receipts?.[0]?.receiptNumber || sale.id.slice(0, 8);
  const organizationName = sale.branch?.organization?.name || 'Store';
  const branchName = sale.branch?.name;
  const branchAddress = sale.branch?.address;

  return (
    <Document>
      <Page size={[226, 800]} style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.orgName}>{organizationName}</Text>
          {branchName && <Text style={styles.branchName}>{branchName}</Text>}
          {branchAddress && <Text style={styles.branchAddress}>{branchAddress}</Text>}
        </View>

        <View style={styles.row}>
          <Text>Receipt No:</Text>
          <Text>{receiptNumber}</Text>
        </View>
        <View style={styles.row}>
          <Text>Date:</Text>
          <Text>{new Date(sale.createdAt).toLocaleString()}</Text>
        </View>
        
        {sale.customer && (
          <View style={styles.row}>
            <Text>Customer:</Text>
            <Text>{sale.customer.name}</Text>
          </View>
        )}

        <View style={styles.divider} />

        <View style={styles.itemRow}>
          <Text style={[styles.itemName, styles.textBold]}>Item</Text>
          <Text style={[styles.itemQty, styles.textBold]}>Qty</Text>
          <Text style={[styles.itemTotal, styles.textBold]}>Total</Text>
        </View>

        <View style={styles.divider} />

        {sale.items?.map((item: any, idx: number) => {
          const variantName = item.productVariant?.name !== 'Default' ? ` - ${item.productVariant?.name}` : '';
          const name = `${item.productVariant?.product?.name || 'Item'}${variantName}`;
          return (
            <React.Fragment key={idx}>
              <View style={styles.itemRow}>
                <Text style={styles.itemName}>{name}</Text>
                <Text style={styles.itemQty}>{item.quantity}</Text>
                <Text style={styles.itemTotal}>₹{Number(item.subtotal).toFixed(2)}</Text>
              </View>
            </React.Fragment>
          );
        })}

        <View style={styles.divider} />

        <View style={styles.totalsRow}>
          <Text>Subtotal</Text>
          <Text>₹{Number(sale.subtotal).toFixed(2)}</Text>
        </View>

        {sale.taxBreakdown && Array.isArray(sale.taxBreakdown) ? (
          sale.taxBreakdown.map((tax: any, idx: number) => (
            <React.Fragment key={`tax-${idx}`}>
              <View style={styles.totalsRow}>
                <Text>{tax.name} {tax.type === 'PERCENTAGE' ? `(${tax.value}%)` : ''}</Text>
                <Text>+₹{Number(tax.amountCalculated).toFixed(2)}</Text>
              </View>
            </React.Fragment>
          ))
        ) : (
          <View style={styles.totalsRow}>
            <Text>Taxes</Text>
            <Text>₹{Number(sale.taxAmount).toFixed(2)}</Text>
          </View>
        )}

        {Number(sale.discountAmount) > 0 && (
          <View style={styles.totalsRow}>
            <Text>Discount</Text>
            <Text>-₹{Number(sale.discountAmount).toFixed(2)}</Text>
          </View>
        )}

        <View style={styles.grandTotalRow}>
          <Text style={styles.grandTotalText}>Total</Text>
          <Text style={styles.grandTotalText}>₹{Number(sale.grandTotal).toFixed(2)}</Text>
        </View>

        <View style={styles.divider} />

        <View>
          <Text style={styles.sectionTitle}>Payments</Text>
          {sale.payments?.map((payment: any, idx: number) => (
            <React.Fragment key={`pay-${idx}`}>
              <View style={styles.totalsRow}>
                <Text>{payment.method}</Text>
                <Text>₹{Number(payment.amount).toFixed(2)}</Text>
              </View>
            </React.Fragment>
          ))}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Thank you for your business!</Text>
          <Text style={styles.footerText}>Please come again</Text>
        </View>
      </Page>
    </Document>
  );
};

export default ReceiptPDF;
