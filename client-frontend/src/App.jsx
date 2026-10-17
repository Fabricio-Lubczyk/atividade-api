import React, { useState, useEffect, useMemo } from 'react';
import './App.css';
import {
  Package,
  TrendingUp,
  Zap,
  Plus,
  Search,
  RefreshCw,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  X,
  ExternalLink,
  Layers,
  DollarSign,
  Activity,
  Box,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

const API_BASE = 'http://127.0.0.1:8000/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('produtos');
  const [backendStatus, setBackendStatus] = useState('checking'); // 'online' | 'offline' | 'checking'
  
  // Produtos State
  const [produtos, setProdutos] = useState([]);
  const [loadingProdutos, setLoadingProdutos] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduto, setEditingProduto] = useState(null);
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    preco: '',
    quantidade_estoque: '',
    categoria: 'Informática',
    ativo: true,
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Cotações State
  const [cotacoes, setCotacoes] = useState(null);
  const [loadingCotacoes, setLoadingCotacoes] = useState(false);
  const [calcBrl, setCalcBrl] = useState(100);

  // Pokemon State
  const [pokeQuery, setPokeQuery] = useState('pikachu');
  const [pokemon, setPokemon] = useState(null);
  const [loadingPokemon, setLoadingPokemon] = useState(false);
  const [pokeError, setPokeError] = useState(null);

  // Toasts
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // Check Backend Status
  const checkStatus = async () => {
    try {
      const res = await fetch(`${API_BASE}/status`, { signal: AbortSignal.timeout(3000) });
      if (res.ok) {
        setBackendStatus('online');
      } else {
        setBackendStatus('offline');
      }
    } catch {
      setBackendStatus('offline');
    }
  };

  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 15000);
    return () => clearInterval(interval);
  }, []);

  // Fetch Produtos
  const fetchProdutos = async () => {
    setLoadingProdutos(true);
    try {
      const res = await fetch(`${API_BASE}/produtos`);
      if (!res.ok) throw new Error('Erro ao carregar produtos');
      const json = await res.json();
      setProdutos(json.data || []);
      setBackendStatus('online');
    } catch (err) {
      console.error(err);
      setBackendStatus('offline');
      addToast('Não foi possível conectar à API Laravel. Certifique-se de que "php artisan serve" está rodando.', 'error');
    } finally {
      setLoadingProdutos(false);
    }
  };

  useEffect(() => {
    fetchProdutos();
  }, []);

  // Fetch Cotações
  const fetchCotacoes = async () => {
    setLoadingCotacoes(true);
    try {
      const res = await fetch(`${API_BASE}/external/cotacoes`);
      if (!res.ok) throw new Error('Falha ao obter cotações');
      const data = await res.json();
      if (data.sucesso) {
        setCotacoes(data.moedas);
        addToast('Cotações atualizadas em tempo real via AwesomeAPI!', 'info');
      } else {
        throw new Error(data.mensagem || 'Erro desconhecido');
      }
    } catch (err) {
      addToast(`Erro nas cotações: ${err.message}`, 'error');
    } finally {
      setLoadingCotacoes(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'cotacoes' && !cotacoes) {
      fetchCotacoes();
    }
  }, [activeTab]);

  // Fetch Pokemon
  const fetchPokemon = async (name) => {
    const target = name || pokeQuery;
    if (!target) return;
    setLoadingPokemon(true);
    setPokeError(null);
    try {
      const res = await fetch(`${API_BASE}/external/pokemon/${encodeURIComponent(target.toLowerCase().trim())}`);
      const data = await res.json();
      if (data.sucesso) {
        setPokemon(data.dados);
      } else {
        setPokemon(null);
        setPokeError(data.mensagem || 'Pokémon não encontrado');
      }
    } catch {
      setPokemon(null);
      setPokeError('Erro ao comunicar com a API do Laravel.');
    } finally {
      setLoadingPokemon(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'pokemon' && !pokemon) {
      fetchPokemon('pikachu');
    }
  }, [activeTab]);

  // Categories list
  const categories = useMemo(() => {
    const set = new Set(produtos.map((p) => p.categoria).filter(Boolean));
    return ['all', ...Array.from(set)];
  }, [produtos]);

  // Filtered Products
  const filteredProdutos = useMemo(() => {
    return produtos.filter((p) => {
      const matchesSearch =
        p.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.descricao?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCat = selectedCategory === 'all' || p.categoria === selectedCategory;
      return matchesSearch && matchesCat;
    });
  }, [produtos, searchTerm, selectedCategory]);

  // Stats
  const stats = useMemo(() => {
    const totalItens = produtos.length;
    const valorEstoque = produtos.reduce((acc, p) => acc + (p.preco || 0) * (p.quantidade_estoque || 0), 0);
    const semEstoque = produtos.filter((p) => !p.em_estoque).length;
    return {
      totalItens,
      valorEstoque: 'R$ ' + valorEstoque.toLocaleString('pt-BR', { minimumFractionDigits: 2 }),
      semEstoque,
      categoriasCount: categories.length - 1,
    };
  }, [produtos, categories]);

  // Form Handlers
  const openCreateModal = () => {
    setEditingProduto(null);
    setFormData({
      nome: '',
      descricao: '',
      preco: '',
      quantidade_estoque: '',
      categoria: 'Informática',
      ativo: true,
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (prod) => {
    setEditingProduto(prod);
    setFormData({
      nome: prod.nome || '',
      descricao: prod.descricao || '',
      preco: prod.preco || '',
      quantidade_estoque: prod.quantidade_estoque ?? '',
      categoria: prod.categoria || 'Informática',
      ativo: prod.ativo ?? true,
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormErrors({});

    const payload = {
      ...formData,
      preco: parseFloat(formData.preco),
      quantidade_estoque: parseInt(formData.quantidade_estoque, 10),
    };

    const isEdit = !!editingProduto;
    const url = isEdit ? `${API_BASE}/produtos/${editingProduto.id}` : `${API_BASE}/produtos`;
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.status === 422) {
        setFormErrors(data.errors || {});
        addToast('Por favor, corrija os erros de validação.', 'error');
        return;
      }

      if (!res.ok) {
        throw new Error(data.message || 'Erro ao salvar produto');
      }

      addToast(isEdit ? 'Produto atualizado com sucesso!' : 'Novo produto cadastrado com sucesso!');
      setIsModalOpen(false);
      fetchProdutos();
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Handlers
  const openDeleteModal = (prod) => {
    setProductToDelete(prod);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`${API_BASE}/produtos/${productToDelete.id}`, {
        method: 'DELETE',
        headers: { Accept: 'application/json' },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Erro ao excluir');
      addToast(`Produto "${productToDelete.nome}" removido com sucesso.`);
      setIsDeleteModalOpen(false);
      fetchProdutos();
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="app-container">
      {/* App Header */}
      <header className="app-header">
        <div className="brand-wrapper">
          <div className="brand-icon">
            <Layers size={24} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 className="brand-title">Laravel API Hub</h1>
              <span className="tag-badge">React Client</span>
            </div>
            <p className="brand-subtitle">
              Consumo de API Externa • Rotas RESTful • Resource • Postman
            </p>
          </div>
        </div>

        <div className="header-status">
          <div className={`status-pill ${backendStatus}`}>
            <span className="status-dot"></span>
            <span>
              {backendStatus === 'online'
                ? 'Backend Laravel Online (Porta 8000)'
                : backendStatus === 'checking'
                ? 'Verificando Backend...'
                : 'Backend Offline (Conectando...)'}
            </span>
          </div>
          <button
            className="btn-secondary"
            title="Recarregar status da API"
            onClick={() => {
              checkStatus();
              fetchProdutos();
            }}
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="tabs-nav">
        <button
          className={`tab-btn ${activeTab === 'produtos' ? 'active' : ''}`}
          onClick={() => setActiveTab('produtos')}
        >
          <Package size={18} />
          <span>Produtos (API RESTful CRUD)</span>
          <span style={{ opacity: 0.8, fontSize: '11px', background: 'rgba(0,0,0,0.2)', padding: '2px 6px', borderRadius: '10px' }}>
            {produtos.length}
          </span>
        </button>

        <button
          className={`tab-btn ${activeTab === 'cotacoes' ? 'active' : ''}`}
          onClick={() => setActiveTab('cotacoes')}
        >
          <TrendingUp size={18} />
          <span>Cotações em Tempo Real (AwesomeAPI)</span>
        </button>

        <button
          className={`tab-btn ${activeTab === 'pokemon' ? 'active' : ''}`}
          onClick={() => setActiveTab('pokemon')}
        >
          <Zap size={18} />
          <span>PokeAPI Explorer</span>
        </button>
      </nav>

      {/* TAB 1: PRODUTOS (CRUD RESTFUL) */}
      {activeTab === 'produtos' && (
        <section className="animate-fade-in">
          {/* Stats Bar */}
          <div className="stats-grid">
            <div className="stat-card glass-panel">
              <div className="stat-icon indigo">
                <Box size={24} />
              </div>
              <div className="stat-info">
                <span className="stat-label">Total de Produtos</span>
                <span className="stat-value">{stats.totalItens}</span>
              </div>
            </div>

            <div className="stat-card glass-panel">
              <div className="stat-icon emerald">
                <DollarSign size={24} />
              </div>
              <div className="stat-info">
                <span className="stat-label">Patrimônio em Estoque</span>
                <span className="stat-value" style={{ fontSize: '20px' }}>{stats.valorEstoque}</span>
              </div>
            </div>

            <div className="stat-card glass-panel">
              <div className="stat-icon cyan">
                <Activity size={24} />
              </div>
              <div className="stat-info">
                <span className="stat-label">Categorias Ativas</span>
                <span className="stat-value">{stats.categoriasCount}</span>
              </div>
            </div>

            <div className="stat-card glass-panel">
              <div className="stat-icon amber">
                <AlertCircle size={24} />
              </div>
              <div className="stat-info">
                <span className="stat-label">Itens Esgotados</span>
                <span className="stat-value">{stats.semEstoque}</span>
              </div>
            </div>
          </div>

          {/* Toolbar */}
          <div className="toolbar-section">
            <div className="search-filter-group">
              <div className="search-box">
                <Search size={18} className="search-icon" />
                <input
                  type="text"
                  className="search-input"
                  placeholder="Pesquisar por nome ou descrição..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <select
                className="select-filter"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="all">Todas as Categorias</option>
                {categories
                  .filter((c) => c !== 'all')
                  .map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
              </select>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="btn-secondary" onClick={fetchProdutos} title="Atualizar Lista">
                <RefreshCw size={16} className={loadingProdutos ? 'animate-spin' : ''} />
              </button>
              <button className="btn-primary" onClick={openCreateModal}>
                <Plus size={18} />
                <span>Cadastrar Produto</span>
              </button>
            </div>
          </div>

          {/* Products Grid */}
          {loadingProdutos ? (
            <div className="empty-state glass-panel">
              <RefreshCw size={36} className="animate-spin" style={{ margin: '0 auto 16px auto', display: 'block', color: 'var(--primary)' }} />
              <p>Carregando produtos da API RESTful...</p>
            </div>
          ) : filteredProdutos.length === 0 ? (
            <div className="empty-state glass-panel">
              <Package className="empty-icon" />
              <h3>Nenhum produto encontrado</h3>
              <p style={{ marginTop: '8px' }}>
                {searchTerm || selectedCategory !== 'all'
                  ? 'Tente ajustar os filtros ou a busca acima.'
                  : 'Clique em "Cadastrar Produto" para adicionar o primeiro item.'}
              </p>
            </div>
          ) : (
            <div className="products-grid">
              {filteredProdutos.map((prod) => (
                <div key={prod.id} className="product-card glass-panel animate-fade-in">
                  <div>
                    <div className="product-header">
                      <span className="product-category-tag">{prod.categoria}</span>
                      <span className={`stock-badge ${prod.em_estoque ? 'in-stock' : 'out-of-stock'}`}>
                        {prod.em_estoque ? `Estoque: ${prod.quantidade_estoque}` : 'Esgotado'}
                      </span>
                    </div>

                    <h3 className="product-title">{prod.nome}</h3>
                    <p className="product-desc">{prod.descricao || 'Sem descrição informada.'}</p>
                  </div>

                  <div>
                    <div className="product-meta-row">
                      <div>
                        <span style={{ fontSize: '11px', color: 'var(--text-dim)', display: 'block' }}>Preço Unitário</span>
                        <span className="product-price">{prod.preco_formatado}</span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '11px', color: 'var(--text-dim)', display: 'block' }}>ID Resource</span>
                        <span style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>#{prod.id}</span>
                      </div>
                    </div>

                    <div className="product-actions">
                      <button className="action-btn" onClick={() => openEditModal(prod)}>
                        <Edit2 size={14} />
                        <span>Editar</span>
                      </button>
                      <button className="action-btn delete" onClick={() => openDeleteModal(prod)}>
                        <Trash2 size={14} />
                        <span>Excluir</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* TAB 2: COTAÇÕES DE MOEDAS (AWESOMEAPI) */}
      {activeTab === 'cotacoes' && (
        <section className="currency-section animate-fade-in">
          <div className="currency-header-box glass-panel">
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 800 }}>Cotações do Mercado Financeiro</h2>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
                Consumindo a API pública <strong>AwesomeAPI</strong> através do backend Laravel (<code>GET /api/external/cotacoes</code>)
              </p>
            </div>
            <button className="btn-primary" onClick={fetchCotacoes} disabled={loadingCotacoes}>
              <RefreshCw size={16} className={loadingCotacoes ? 'animate-spin' : ''} />
              <span>{loadingCotacoes ? 'Atualizando...' : 'Atualizar Cotações'}</span>
            </button>
          </div>

          {cotacoes ? (
            <>
              <div className="currency-cards-grid">
                {/* Dólar */}
                <div className="currency-card glass-panel">
                  <div className="currency-card-top">
                    <div className="currency-symbol-box usd">$</div>
                    <span className={`currency-pct ${cotacoes.dolar.porcentagem_variacao >= 0 ? 'positive' : 'negative'}`}>
                      {cotacoes.dolar.porcentagem_variacao >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                      {cotacoes.dolar.porcentagem_variacao > 0 ? `+${cotacoes.dolar.porcentagem_variacao}%` : `${cotacoes.dolar.porcentagem_variacao}%`}
                    </span>
                  </div>

                  <div className="currency-values-main">
                    <span className="currency-label">{cotacoes.dolar.nome}</span>
                    <span className="currency-rate">R$ {cotacoes.dolar.compra.toFixed(2)}</span>
                  </div>

                  <div className="currency-details-grid">
                    <div className="currency-detail-item">
                      <span className="currency-detail-label">Máxima do Dia</span>
                      <span className="currency-detail-val">R$ {cotacoes.dolar.maxima.toFixed(2)}</span>
                    </div>
                    <div className="currency-detail-item">
                      <span className="currency-detail-label">Mínima do Dia</span>
                      <span className="currency-detail-val">R$ {cotacoes.dolar.minima.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Euro */}
                <div className="currency-card glass-panel">
                  <div className="currency-card-top">
                    <div className="currency-symbol-box eur">€</div>
                    <span className={`currency-pct ${cotacoes.euro.porcentagem_variacao >= 0 ? 'positive' : 'negative'}`}>
                      {cotacoes.euro.porcentagem_variacao >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                      {cotacoes.euro.porcentagem_variacao > 0 ? `+${cotacoes.euro.porcentagem_variacao}%` : `${cotacoes.euro.porcentagem_variacao}%`}
                    </span>
                  </div>

                  <div className="currency-values-main">
                    <span className="currency-label">{cotacoes.euro.nome}</span>
                    <span className="currency-rate">R$ {cotacoes.euro.compra.toFixed(2)}</span>
                  </div>

                  <div className="currency-details-grid">
                    <div className="currency-detail-item">
                      <span className="currency-detail-label">Máxima do Dia</span>
                      <span className="currency-detail-val">R$ {cotacoes.euro.maxima.toFixed(2)}</span>
                    </div>
                    <div className="currency-detail-item">
                      <span className="currency-detail-label">Mínima do Dia</span>
                      <span className="currency-detail-val">R$ {cotacoes.euro.minima.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Bitcoin */}
                <div className="currency-card glass-panel">
                  <div className="currency-card-top">
                    <div className="currency-symbol-box btc">₿</div>
                    <span className={`currency-pct ${cotacoes.bitcoin.porcentagem_variacao >= 0 ? 'positive' : 'negative'}`}>
                      {cotacoes.bitcoin.porcentagem_variacao >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                      {cotacoes.bitcoin.porcentagem_variacao > 0 ? `+${cotacoes.bitcoin.porcentagem_variacao}%` : `${cotacoes.bitcoin.porcentagem_variacao}%`}
                    </span>
                  </div>

                  <div className="currency-values-main">
                    <span className="currency-label">{cotacoes.bitcoin.nome}</span>
                    <span className="currency-rate" style={{ fontSize: '23px' }}>
                      R$ {cotacoes.bitcoin.compra.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="currency-details-grid">
                    <div className="currency-detail-item">
                      <span className="currency-detail-label">Variação Real</span>
                      <span className="currency-detail-val">
                        {cotacoes.bitcoin.variacao >= 0 ? '+' : ''}R$ {cotacoes.bitcoin.variacao.toLocaleString('pt-BR')}
                      </span>
                    </div>
                    <div className="currency-detail-item">
                      <span className="currency-detail-label">Última Atualização</span>
                      <span className="currency-detail-val">{cotacoes.bitcoin.atualizado_em?.split(' ')[1] || 'Recente'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Conversor Interativo em Tempo Real */}
              <div className="converter-box glass-panel">
                <h3 className="converter-title">Calculadora de Conversão Instantânea</h3>
                <p className="converter-subtitle">
                  Digite qualquer quantia em Reais (BRL) para calcular o valor correspondente nas moedas consumidas da API:
                </p>

                <div className="converter-grid">
                  <div>
                    <label className="form-label">Valor em Reais (R$)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={calcBrl}
                      min="1"
                      step="any"
                      onChange={(e) => setCalcBrl(Math.max(0, parseFloat(e.target.value) || 0))}
                    />
                  </div>

                  <div className="converter-result-card">
                    <div className="converter-result-currency">Dólar Americano (USD)</div>
                    <div className="converter-result-val">
                      $ {(calcBrl / (cotacoes.dolar.compra || 1)).toFixed(2)}
                    </div>
                  </div>

                  <div className="converter-result-card">
                    <div className="converter-result-currency">Euro (EUR)</div>
                    <div className="converter-result-val">
                      € {(calcBrl / (cotacoes.euro.compra || 1)).toFixed(2)}
                    </div>
                  </div>

                  <div className="converter-result-card">
                    <div className="converter-result-currency">Bitcoin (BTC)</div>
                    <div className="converter-result-val" style={{ fontSize: '16px' }}>
                      ₿ {(calcBrl / (cotacoes.bitcoin.compra || 1)).toFixed(6)}
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="empty-state glass-panel">
              <RefreshCw size={36} className="animate-spin" style={{ margin: '0 auto 16px auto', display: 'block', color: 'var(--primary)' }} />
              <p>Consultando dados de cotação da AwesomeAPI...</p>
            </div>
          )}
        </section>
      )}

      {/* TAB 3: POKEAPI EXPLORER */}
      {activeTab === 'pokemon' && (
        <section className="pokemon-section animate-fade-in">
          <div className="pokemon-search-card glass-panel">
            <h2 style={{ fontSize: '20px', fontWeight: 800 }}>PokeAPI Explorer</h2>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px', marginBottom: '16px' }}>
              Consumo da <strong>PokeAPI</strong> através do backend Laravel (<code>GET /api/external/pokemon/{'{name}'}</code>)
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                fetchPokemon(pokeQuery);
              }}
              style={{ display: 'flex', gap: '10px' }}
            >
              <input
                type="text"
                className="form-input"
                placeholder="Digite o nome de um Pokémon (ex: charizard, gengar, mewtwo)..."
                value={pokeQuery}
                onChange={(e) => setPokeQuery(e.target.value)}
              />
              <button type="submit" className="btn-primary" disabled={loadingPokemon}>
                <Search size={16} />
                <span>{loadingPokemon ? 'Buscando...' : 'Buscar'}</span>
              </button>
            </form>

            <div className="pokemon-suggestions">
              <span style={{ fontSize: '12px', color: 'var(--text-dim)' }}>Sugestões rápidas:</span>
              {['pikachu', 'charizard', 'gengar', 'mewtwo', 'bulbasaur', 'lucario', 'eevee'].map((p) => (
                <button
                  key={p}
                  className="suggestion-chip"
                  onClick={() => {
                    setPokeQuery(p);
                    fetchPokemon(p);
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {loadingPokemon ? (
            <div className="empty-state glass-panel">
              <RefreshCw size={36} className="animate-spin" style={{ margin: '0 auto 16px auto', display: 'block', color: 'var(--primary)' }} />
              <p>Consultando Pokémon na PokeAPI...</p>
            </div>
          ) : pokeError ? (
            <div className="empty-state glass-panel" style={{ color: 'var(--rose)' }}>
              <AlertCircle size={42} style={{ margin: '0 auto 12px auto', display: 'block' }} />
              <h3>{pokeError}</h3>
              <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>
                Verifique se o nome está correto em inglês e tente novamente.
              </p>
            </div>
          ) : pokemon ? (
            <div className="pokemon-display-card glass-panel animate-fade-in">
              <div className="pokemon-artwork-container">
                {pokemon.imagem ? (
                  <img src={pokemon.imagem} alt={pokemon.nome} className="pokemon-img" />
                ) : (
                  <Zap size={80} style={{ color: 'var(--primary)' }} />
                )}
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  <h2 style={{ fontSize: '28px', fontWeight: 800 }}>{pokemon.nome}</h2>
                  <span className="tag-badge">ID #{pokemon.id}</span>
                </div>

                <div className="pokemon-types-list">
                  {pokemon.tipos.map((t) => (
                    <span key={t} className={`type-pill type-${t} type-default`}>
                      {t}
                    </span>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: '24px', fontSize: '14px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                  <div>
                    <span style={{ color: 'var(--text-dim)', display: 'block', fontSize: '12px' }}>ALTURA</span>
                    <strong style={{ color: 'var(--text-main)' }}>{pokemon.altura}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-dim)', display: 'block', fontSize: '12px' }}>PESO</span>
                    <strong style={{ color: 'var(--text-main)' }}>{pokemon.peso}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-dim)', display: 'block', fontSize: '12px' }}>HABILIDADES</span>
                    <strong style={{ color: 'var(--text-main)' }}>{pokemon.habilidades.join(', ')}</strong>
                  </div>
                </div>

                <h4 style={{ fontSize: '13px', textTransform: 'uppercase', color: 'var(--text-dim)', letterSpacing: '0.5px' }}>
                  Estatísticas de Batalha
                </h4>

                <div className="pokemon-stats-bars">
                  {Object.entries(pokemon.estatisticas || {}).map(([stat, val]) => (
                    <div key={stat} className="stat-bar-row">
                      <span className="stat-bar-name">{stat}</span>
                      <div className="stat-bar-track">
                        <div
                          className="stat-bar-fill"
                          style={{ width: `${Math.min(100, (val / 150) * 100)}%` }}
                        ></div>
                      </div>
                      <span className="stat-bar-num">{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </section>
      )}

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                {editingProduto ? 'Editar Produto' : 'Cadastrar Novo Produto'}
              </h3>
              <button className="modal-close-btn" onClick={() => setIsModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Nome do Produto *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ex: Teclado Mecânico RGB"
                  value={formData.nome}
                  required
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                />
                {formErrors.nome && (
                  <span style={{ color: 'var(--rose)', fontSize: '12px' }}>{formErrors.nome[0]}</span>
                )}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Preço (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    className="form-input"
                    placeholder="Ex: 299.90"
                    value={formData.preco}
                    required
                    onChange={(e) => setFormData({ ...formData, preco: e.target.value })}
                  />
                  {formErrors.preco && (
                    <span style={{ color: 'var(--rose)', fontSize: '12px' }}>{formErrors.preco[0]}</span>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Estoque (Qtd) *</label>
                  <input
                    type="number"
                    min="0"
                    className="form-input"
                    placeholder="Ex: 25"
                    value={formData.quantidade_estoque}
                    required
                    onChange={(e) => setFormData({ ...formData, quantidade_estoque: e.target.value })}
                  />
                  {formErrors.quantidade_estoque && (
                    <span style={{ color: 'var(--rose)', fontSize: '12px' }}>
                      {formErrors.quantidade_estoque[0]}
                    </span>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Categoria *</label>
                <select
                  className="form-select"
                  value={formData.categoria}
                  onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                >
                  <option value="Informática">Informática</option>
                  <option value="Periféricos">Periféricos</option>
                  <option value="Eletrônicos">Eletrônicos</option>
                  <option value="Hardware">Hardware</option>
                  <option value="Games">Games</option>
                  <option value="Acessórios">Acessórios</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Descrição</label>
                <textarea
                  className="form-textarea"
                  placeholder="Detalhes adicionais, especificações técnicas..."
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                />
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <RefreshCw size={16} className="animate-spin" />
                      <span>Salvando...</span>
                    </>
                  ) : (
                    <span>{editingProduto ? 'Salvar Alterações' : 'Criar Produto'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {isDeleteModalOpen && productToDelete && (
        <div className="modal-overlay" onClick={() => setIsDeleteModalOpen(false)}>
          <div className="modal-content animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title" style={{ color: 'var(--rose)' }}>
                Confirmar Exclusão
              </h3>
              <button className="modal-close-btn" onClick={() => setIsDeleteModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.6 }}>
              Tem certeza de que deseja remover o produto{' '}
              <strong style={{ color: 'var(--text-main)' }}>"{productToDelete.nome}"</strong>?
              Esta ação enviará uma requisição <code>DELETE /api/produtos/{productToDelete.id}</code> para o Laravel.
            </p>

            <div className="modal-footer">
              <button
                className="btn-secondary"
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={isDeleting}
              >
                Cancelar
              </button>
              <button className="btn-danger" onClick={confirmDelete} disabled={isDeleting}>
                {isDeleting ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    <span>Excluindo...</span>
                  </>
                ) : (
                  <>
                    <Trash2 size={16} />
                    <span>Excluir Definitivamente</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notifications */}
      <div className="toast-container">
        {toasts.map((t) => (
          <div key={t.id} className={`toast ${t.type}`}>
            {t.type === 'success' && <CheckCircle2 size={16} />}
            {t.type === 'error' && <AlertCircle size={16} />}
            {t.type === 'info' && <ExternalLink size={16} />}
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
