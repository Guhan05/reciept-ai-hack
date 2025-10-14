// src/components/ReceiptUpload.jsx

import React, { useState } from 'react';
import { uploadReceipt } from '../api';
import { UploadCloud, Loader, X, Scan } from 'lucide-react';

export default function ReceiptUpload({ onUploadSuccess }) {
    const [file, setFile] = useState(null);
    const [category, setCategory] = useState('Groceries');
    const [scanning, setScanning] = useState(false);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
        }
        // Reset the input value to allow selecting the same file again
        e.target.value = '';
    };

    const handleScan = async () => {
        if (!file) return;
        
        const formData = new FormData();
        formData.append('file', file);
        formData.append('category', category); // Send category to backend
        setScanning(true);

        try {
            const response = await uploadReceipt(formData);
            const { ocr_fields, match, new_txn_created } = response.data;

            let resultMessage = `Scan Complete!\n\n--- OCR Results ---\nMerchant: ${ocr_fields.merchant || 'N/A'}\nTotal: ${ocr_fields.total || 'N/A'}\nDate: ${ocr_fields.date || 'N/A'}`;
            
            if (match && !new_txn_created) {
                resultMessage += `\n\n--- Analysis ---\n✅ Found a matching transaction with ${Math.round(match.confidence * 100)}% confidence.\nReceipt has been linked.`;
            } else if (new_txn_created) {
                 resultMessage += `\n\n--- Analysis ---\n⚠️ No high-confidence match found. A new transaction has been created under the category '${category}'.`;
            }

            alert(resultMessage);
            onUploadSuccess();
        } catch (error) {
            console.error("Scan/Upload Error:", error);
            alert('Scan failed. The file might be unreadable or an error occurred.');
        } finally {
            setScanning(false);
            setFile(null);
        }
    };

    const cancelSelection = () => {
        setFile(null);
    };

    if (scanning) {
        return (
            <div>
                <h3 style={{ marginBottom: '1rem' }}>Scan Receipt</h3>
                <div style={{textAlign: 'center', padding: '1rem', color: 'var(--neon-teal)'}}>
                    <Loader className="animate-spin" style={{margin: '0 auto 0.5rem'}}/>
                    <p>Scanning & Analyzing...</p>
                    <p style={{fontSize: '0.8rem', color: 'var(--text-muted)'}}>{file?.name}</p>
                </div>
            </div>
        );
    }
    
    return (
        <div>
            <h3 style={{ marginBottom: '1rem' }}>Scan Receipt</h3>
            {!file ? (
                <>
                    <input type="file" id="file-upload" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
                    <label htmlFor="file-upload" className="neon-button" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', textAlign: 'center', cursor: 'pointer' }}>
                        <UploadCloud size={20} /> 
                        <span>Select a Receipt</span>
                    </label>
                    <p style={{fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '1rem'}}>
                        Select a receipt image to begin.
                    </p>
                </>
            ) : (
                <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--border-color)', padding: '0.5rem', borderRadius: '0.5rem' }}>
                        <p style={{fontSize: '0.8rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</p>
                        <button onClick={cancelSelection} style={{background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)'}}><X size={16}/></button>
                    </div>

                    <select value={category} onChange={e => setCategory(e.target.value)} className="glass-input">
                        <option>Groceries</option>
                        <option>Dining</option>
                        <option>Transport</option>
                        <option>Shopping</option>
                        <option>Utilities</option>
                        <option>Health</option>
                        <option>Travel</option>
                        <option>Other</option>
                    </select>

                    <button onClick={handleScan} className="neon-button" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                        <Scan size={16} />
                        Confirm & Scan
                    </button>
                </div>
            )}
        </div>
    );
}