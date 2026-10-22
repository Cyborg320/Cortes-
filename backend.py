from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Permite comunicação entre navegador e programa

# Funções principais do seu sistema
def processar_dados(dados):
    """Lógica de processamento — personalize aqui!"""
    return f"Recebido: '{dados}' | Em maiúsculas: '{dados.upper()}' | Caracteres: {len(dados)}"

@app.route('/processar', methods=['POST'])
def rota_processar():
    conteudo = request.get_json()
    dados_entrada = conteudo.get('dados', '')
    
    resultado = processar_dados(dados_entrada)
    
    return jsonify({
        "mensagem": "Processamento concluído com sucesso!",
        "dados": resultado
    })

@app.route('/limpar', methods=['GET'])
def rota_limpar():
    return jsonify({"mensagem": "🧹 Sistema limpo! Pronto para novos dados."})

@app.route('/status', methods=['GET'])
def rota_status():
    return jsonify({"mensagem": "🟢 Sistema online e funcionando perfeitamente!"})

if __name__ == '__main__':
    print("🚀 Programa integrado rodando em http://localhost:5000")
    print("🌐 Abra o index.html no navegador para usar!")
    app.run(debug=True, port=5000)