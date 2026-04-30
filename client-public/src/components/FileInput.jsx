import { useState, useRef } from 'react';
import { Upload, X, FileText, Image } from 'lucide-react';

export default function FileInput({ accept, onChange, label, id, disabled = false }) {
  const [fileName, setFileName] = useState('');
  const inputRef = useRef(null);

  const isImage = accept?.includes('image');
  const Icon = isImage ? Image : FileText;
  const placeholder = isImage ? 'Choose an image…' : 'Choose a file…';

  const handleChange = (e) => {
    const file = e.target.files?.[0] || null;
    setFileName(file ? file.name : '');
    if (onChange) onChange(e);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    setFileName('');
    if (inputRef.current) inputRef.current.value = '';
    if (onChange) onChange({ target: { files: [] } });
  };

  return (
    <div
      className={`file-input ${fileName ? 'file-input--has-file' : ''} ${disabled ? 'file-input--disabled' : ''}`}
      onClick={() => !disabled && inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept={accept}
        onChange={handleChange}
        disabled={disabled}
        className="file-input__native"
      />
      <div className="file-input__icon">
        {fileName ? <Icon size={18} strokeWidth={2} /> : <Upload size={18} strokeWidth={2} />}
      </div>
      <span className="file-input__text">
        {fileName || placeholder}
      </span>
      {fileName && (
        <button type="button" className="file-input__clear" onClick={handleClear} title="Remove file">
          <X size={14} strokeWidth={2} />
        </button>
      )}
    </div>
  );
}
