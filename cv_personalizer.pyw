import tkinter as tk
from tkinter import ttk, filedialog, messagebox
import json
import os
import shutil
import subprocess
from pathlib import Path

class CVPersonalizerApp:
    def __init__(self, root):
        self.root = root
        self.root.title("CV Personalizer - Company Manager")
        self.root.geometry("650x750")
        self.root.resizable(False, False)
        
        # Define paths
        self.script_dir = Path(__file__).parent
        self.json_path = self.script_dir / "companies.json"
        self.logos_dir = self.script_dir / "img" / "logos"
        self.logos_dir.mkdir(parents=True, exist_ok=True)
        
        # Logo upload mode
        self.logo_mode = tk.StringVar(value="url")
        self.selected_file = None
        
        # Build UI
        self.build_ui()
    
    def build_ui(self):
        # Title
        title_label = ttk.Label(self.root, text="Add New Company to CV", font=("Arial", 14, "bold"))
        title_label.pack(pady=10)
        
        # Frame for inputs
        frame = ttk.Frame(self.root, padding="20")
        frame.pack(fill=tk.BOTH, expand=True)
        
        # Company ID
        ttk.Label(frame, text="Short ID (Key):").grid(row=0, column=0, sticky=tk.W, pady=5)
        self.id_entry = ttk.Entry(frame, width=40)
        self.id_entry.grid(row=0, column=1, pady=5, padx=5)
        ttk.Label(frame, text="e.g., 'xship'", font=("Arial", 8, "italic"), foreground="gray").grid(row=0, column=2)
        
        # Company Name
        ttk.Label(frame, text="Full Company Name:").grid(row=1, column=0, sticky=tk.W, pady=5)
        self.name_entry = ttk.Entry(frame, width=40)
        self.name_entry.grid(row=1, column=1, pady=5, padx=5)
        
        # Logo selection
        ttk.Label(frame, text="Logo Source:").grid(row=2, column=0, sticky=tk.W, pady=10)
        
        # Radio buttons for logo source
        ttk.Radiobutton(frame, text="Enter URL", variable=self.logo_mode, value="url", 
                       command=self.update_logo_ui).grid(row=3, column=0, sticky=tk.W)
        ttk.Radiobutton(frame, text="Upload File", variable=self.logo_mode, value="file",
                       command=self.update_logo_ui).grid(row=4, column=0, sticky=tk.W)
        
        # Logo URL input
        self.url_label = ttk.Label(frame, text="Logo URL:")
        self.url_label.grid(row=3, column=1, sticky=tk.W, pady=5)
        self.url_entry = ttk.Entry(frame, width=40)
        self.url_entry.grid(row=3, column=1, pady=5, padx=5)
        
        # Logo file upload
        self.file_label = ttk.Label(frame, text="Selected: None", foreground="gray")
        self.file_label.grid(row=4, column=1, sticky=tk.W, pady=5)
        self.file_btn = ttk.Button(frame, text="Browse...", command=self.browse_logo, state=tk.DISABLED)
        self.file_btn.grid(row=4, column=2, padx=5)
        
        # Separator
        ttk.Separator(frame, orient=tk.HORIZONTAL).grid(row=5, column=0, columnspan=3, sticky="ew", pady=15)
        
        # Buttons
        button_frame = ttk.Frame(frame)
        button_frame.grid(row=6, column=0, columnspan=3, pady=10)
        
        ttk.Button(button_frame, text="Add to JSON", command=self.add_company).pack(side=tk.LEFT, padx=5)
        ttk.Button(button_frame, text="Publish with Git", command=self.git_publish).pack(side=tk.LEFT, padx=5)
        
        # Output section
        ttk.Separator(frame, orient=tk.HORIZONTAL).grid(row=7, column=0, columnspan=3, sticky="ew", pady=15)
        
        ttk.Label(frame, text="Output:", font=("Arial", 10, "bold")).grid(row=8, column=0, sticky=tk.W)
        
        # Text area for output
        self.output_text = tk.Text(frame, height=8, width=60, state=tk.DISABLED, 
                                   wrap=tk.WORD, bg="#f5f5f5", font=("Courier", 9))
        self.output_text.grid(row=9, column=0, columnspan=3, pady=5, sticky="nsew")
        
        # Scrollbar for output
        scrollbar = ttk.Scrollbar(frame, orient=tk.VERTICAL, command=self.output_text.yview)
        scrollbar.grid(row=9, column=3, sticky="ns")
        self.output_text.config(yscrollcommand=scrollbar.set)
        
        frame.rowconfigure(9, weight=1)
    
    def update_logo_ui(self):
        """Toggle between URL and file upload UI"""
        if self.logo_mode.get() == "url":
            self.url_entry.config(state=tk.NORMAL)
            self.file_btn.config(state=tk.DISABLED)
            self.selected_file = None
            self.file_label.config(text="Selected: None")
        else:
            self.url_entry.config(state=tk.DISABLED)
            self.file_btn.config(state=tk.NORMAL)
    
    def browse_logo(self):
        """Open file dialog to select logo"""
        file_path = filedialog.askopenfilename(
            title="Select Logo File",
            filetypes=[("Image Files", "*.png *.jpg *.jpeg *.gif"), ("All Files", "*.*")]
        )
        if file_path:
            self.selected_file = file_path
            file_name = os.path.basename(file_path)
            self.file_label.config(text=f"Selected: {file_name}")
    
    def add_company(self):
        """Add company to JSON"""
        company_id = self.id_entry.get().strip()
        company_name = self.name_entry.get().strip()
        
        if not company_id or not company_name:
            messagebox.showerror("Error", "Please fill in ID and Company Name")
            return
        
        # Determine logo path
        if self.logo_mode.get() == "url":
            logo_path = self.url_entry.get().strip()
            if not logo_path:
                messagebox.showerror("Error", "Please enter a logo URL")
                return
        else:
            if not self.selected_file:
                messagebox.showerror("Error", "Please select a logo file")
                return
            
            # Copy file to img/logos directory
            file_ext = os.path.splitext(self.selected_file)[1]
            dest_name = f"{company_id}{file_ext}"
            dest_path = self.logos_dir / dest_name
            
            try:
                shutil.copy2(self.selected_file, dest_path)
                logo_path = f"../img/logos/{dest_name}"
                self.log_output(f"✓ Logo copied to {logo_path}")
            except Exception as e:
                messagebox.showerror("Error", f"Failed to copy logo: {e}")
                return
        
        # Load existing JSON
        try:
            if self.json_path.exists():
                with open(self.json_path, 'r', encoding='utf-8') as f:
                    companies = json.load(f)
            else:
                companies = {}
        except Exception as e:
            messagebox.showerror("Error", f"Failed to read companies.json: {e}")
            return
        
        # Add new company
        companies[company_id] = {
            "name": company_name,
            "logo": logo_path
        }
        
        # Write back to JSON
        try:
            with open(self.json_path, 'w', encoding='utf-8') as f:
                json.dump(companies, f, indent=2, ensure_ascii=False)
            
            self.log_output(f"✓ Company '{company_name}' added with ID '{company_id}'")
            self.log_output(f"✓ companies.json updated")
            
            # Generate CV link
            base_url = "https://cptburakde.github.io"
            cv_link = f"{base_url}/cv/mycv.html?id={company_id}"
            self.log_output(f"\n📌 CV Link:\n{cv_link}")
            
            messagebox.showinfo("Success", f"Company added!\n\nCV Link:\n{cv_link}")
            self.clear_inputs()
            
        except Exception as e:
            messagebox.showerror("Error", f"Failed to write companies.json: {e}")
    
    def git_publish(self):
        """Execute git commands to publish changes"""
        try:
            os.chdir(self.script_dir)
            
            self.log_output("🔄 Running git commands...\n")
            
            # git add
            subprocess.run(["git", "add", "."], check=True, capture_output=True)
            self.log_output("✓ git add .")
            
            # git commit
            result = subprocess.run(
                ["git", "commit", "-m", "Updated."],
                check=True, capture_output=True, text=True
            )
            self.log_output("✓ git commit -m 'Updated.'")
            
            # git push
            subprocess.run(["git", "push", "origin", "main"], check=True, capture_output=True)
            self.log_output("✓ git push origin main")
            
            self.log_output("\n✅ Published successfully!")
            messagebox.showinfo("Success", "Changes published to GitHub!")
            
        except subprocess.CalledProcessError as e:
            error_msg = e.stderr if e.stderr else str(e)
            self.log_output(f"❌ Git error:\n{error_msg}")
            messagebox.showerror("Git Error", f"Failed to publish:\n{error_msg}")
        except Exception as e:
            self.log_output(f"❌ Error: {str(e)}")
            messagebox.showerror("Error", f"Unexpected error:\n{str(e)}")
    
    def log_output(self, message):
        """Append message to output text area"""
        self.output_text.config(state=tk.NORMAL)
        self.output_text.insert(tk.END, message + "\n")
        self.output_text.see(tk.END)
        self.output_text.config(state=tk.DISABLED)
    
    def clear_inputs(self):
        """Clear input fields"""
        self.id_entry.delete(0, tk.END)
        self.name_entry.delete(0, tk.END)
        self.url_entry.delete(0, tk.END)
        self.selected_file = None
        self.file_label.config(text="Selected: None")
        self.logo_mode.set("url")
        self.update_logo_ui()

if __name__ == "__main__":
    root = tk.Tk()
    app = CVPersonalizerApp(root)
    root.mainloop()
