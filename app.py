import os
from flask import Flask, render_template, request, jsonify
from supabase import create_client, Client
from dotenv import load_dotenv

# Load local environment configurations
load_dotenv()

app = Flask(__name__)

# Initialize Supabase client integration
url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")
supabase: Client = create_client(url, key)

# Main web route to serve the homepage
@app.route('/')
def home():
    return render_template('index.html')

# API Route: Handle incoming booking requests
@app.route('/api/book-repair', methods=['POST'])
def book_repair():
    try:
        data = request.get_json()
        
        customer_name = data.get('name')
        email = data.get('email')
        device_type = data.get('device')
        issue_description = data.get('issue')

        # Simple verification step
        if not all([customer_name, email, device_type, issue_description]):
            return jsonify({"error": "All fields are required."}), 400

        # Inject into Supabase
        response = supabase.table('repair_requests').insert({
            "customer_name": customer_name,
            "email": email,
            "device_type": device_type,
            "issue_description": issue_description
        }).execute()
        
        return jsonify({"message": "Booking request received successfully!", "data": response.data}), 201
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500
        # Route: Serve the private Admin Dashboard HTML page
@app.route('/admin')
def admin_dashboard():
    return render_template('admin.html')

# API Route: Fetch all tickets from Supabase for the dashboard
@app.route('/api/admin/tickets', methods=['GET'])
def admin_get_tickets():
    try:
        # Fetch records ordered by newest arrival
        response = supabase.table('repair_requests').select('*').order('created_at', descending=True).execute()
        return jsonify(response.data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# API Route: Update a ticket's status (Pending -> Completed)
@app.route('/api/admin/tickets/<int:ticket_id>', methods=['PATCH'])
def admin_update_ticket(ticket_id):
    try:
        data = request.get_json()
        new_status = data.get('status')
        
        if not new_status:
            return jsonify({"error": "Status is required"}), 400

        # Update the row status field inside Supabase
        response = supabase.table('repair_requests').update({"status": new_status}).eq("id", ticket_id).execute()
        return jsonify({"message": "Ticket updated successfully!", "data": response.data}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
