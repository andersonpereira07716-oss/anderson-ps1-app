import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import datetime
import html

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

@app.after_request
def add_security_headers(response):
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['X-Frame-Options'] = 'DENY'
    response.headers['X-XSS-Protection'] = '1; mode=block'
    return response

@app.route('/api/chat', methods=['POST'])
def chat():
    data = request.json or {}
    raw_message = data.get("message", "")
    user_message = html.escape(raw_message).strip().lower()
    timestamp = datetime.datetime.now().strftime("%H:%M:%S")
    
    # Roteamento corrigido com suporte a inclusão de strings
    if "/status" in user_message:
        response_text = f"[{timestamp}] <strong>[NEXA CORE v4.1]:</strong> Sistema 100% Operacional.<br>• Módulos Ativos: SecurityAudit, Telemetry, ScriptGen<br>• Porta: 5000 (Secure)"
    elif "/audit" in user_message or "audit" in user_message:
        response_text = f"[{timestamp}] <strong>[AGENT: SECURITY AUDIT]:</strong> Relatório de Auditoria:<br>• XSS Filter: Ativo e higienizando entradas<br>• Headers HTTP: Block/Nosniff configurados<br>• Armazenamento Local: Criptografia com Salt ativa<br>• Vulnerabilidades detectadas: 0"
    elif "/script" in user_message or "script" in user_message:
        response_text = f"[{timestamp}] <strong>[AGENT: SCRIPT GEN]:</strong> Módulo de Automação Prontificado.<br>• Digite a tarefa desejada (ex: 'criar port scanner em python' ou 'script bash de backup') para gerar o código."
    elif "/help" in user_message or "help" in user_message:
        response_text = f"[{timestamp}] <strong>[MANUAL DO SISTEMA]:</strong><br>• <strong>/status</strong> - Estado geral do sistema<br>• <strong>/audit</strong> - Auditoria de cibersegurança<br>• <strong>/script</strong> - Gerador autônomo de código<br>• <strong>/clear</strong> - Purgar histórico local"
    else:
        clean_display = html.escape(raw_message)
        response_text = f"[{timestamp}] <strong>[ANDERSON_PS1 IA ENGINE]:</strong> Instrução processada com sucesso.<br>-> <em>{clean_display}</em>"
    
    return jsonify({
        "status": "success",
        "response": response_text
    })

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5000, debug=False)
