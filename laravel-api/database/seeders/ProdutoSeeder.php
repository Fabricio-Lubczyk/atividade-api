<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ProdutoSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $produtos = [
            [
                'nome' => 'Notebook Dell Inspiron 15',
                'descricao' => 'Intel Core i7 13ª Geração, 16GB RAM, SSD 512GB NVMe, Tela 15.6" Full HD 120Hz',
                'preco' => 4599.90,
                'quantidade_estoque' => 15,
                'categoria' => 'Informática',
                'ativo' => true,
            ],
            [
                'nome' => 'Mouse Gamer Logitech G Pro X Superlight',
                'descricao' => 'Sensor HERO 25K, Menos de 63g, Conexão sem fio Lightspeed, Bateria 70h',
                'preco' => 699.00,
                'quantidade_estoque' => 28,
                'categoria' => 'Periféricos',
                'ativo' => true,
            ],
            [
                'nome' => 'Teclado Mecânico Keychron K2 Pro',
                'descricao' => 'Switches Red lubrificados de fábrica, Bluetooth 5.1 & Cabo, Layout 75%, RGB',
                'preco' => 749.50,
                'quantidade_estoque' => 12,
                'categoria' => 'Periféricos',
                'ativo' => true,
            ],
            [
                'nome' => 'Monitor Gamer LG UltraGear 27"',
                'descricao' => 'Painel IPS 144Hz 1ms, Resolução Quad HD (2560x1440), HDR10, G-Sync Compatible',
                'preco' => 1899.00,
                'quantidade_estoque' => 8,
                'categoria' => 'Eletrônicos',
                'ativo' => true,
            ],
            [
                'nome' => 'Headset Gamer HyperX Cloud Alpha Wireless',
                'descricao' => 'Duração da bateria de até 300 horas, Drivers de câmara dupla 50mm, DTS Spatial Audio',
                'preco' => 1149.00,
                'quantidade_estoque' => 20,
                'categoria' => 'Periféricos',
                'ativo' => true,
            ],
            [
                'nome' => 'SSD NVMe Kingston KC3000 2TB',
                'descricao' => 'Leitura até 7.000 MB/s, Gravação até 7.000 MB/s, Interface PCIe 4.0 NVMe M.2',
                'preco' => 989.90,
                'quantidade_estoque' => 35,
                'categoria' => 'Hardware',
                'ativo' => true,
            ],
            [
                'nome' => 'Cadeira Gamer Ergonomica ThunderX3 TGC12',
                'descricao' => 'Revestimento em couro sintético com detalhes em carbono, Encosto reclinável 180°',
                'preco' => 1299.90,
                'quantidade_estoque' => 5,
                'categoria' => 'Acessórios',
                'ativo' => true,
            ],
            [
                'nome' => 'Webcam Logitech C920s Pro Full HD',
                'descricao' => 'Gravação 1080p a 30fps, Foco automático, Correção de luz HD, Microfones duplos estéreo',
                'preco' => 389.00,
                'quantidade_estoque' => 22,
                'categoria' => 'Periféricos',
                'ativo' => true,
            ],
            [
                'nome' => 'Console PlayStation 5 Slim 1TB',
                'descricao' => 'Edição com leitor de disco, Acompanha Controle sem fio DualSense e Jogo Astro Bot',
                'preco' => 3799.00,
                'quantidade_estoque' => 10,
                'categoria' => 'Games',
                'ativo' => true,
            ],
            [
                'nome' => 'Smartwatch Apple Watch Series 9 GPS 45mm',
                'descricao' => 'Chip S9 SiP, Tela Retina Sempre Ativa de 2000 nits, Sensor de Oxigênio no Sangue',
                'preco' => 3299.00,
                'quantidade_estoque' => 7,
                'categoria' => 'Eletrônicos',
                'ativo' => true,
            ],
        ];

        foreach ($produtos as $produto) {
            \App\Models\Produto::updateOrCreate(
                ['nome' => $produto['nome']],
                $produto
            );
        }
    }
}
