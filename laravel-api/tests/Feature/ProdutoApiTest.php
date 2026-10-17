<?php

namespace Tests\Feature;

use App\Models\Produto;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProdutoApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_pode_listar_produtos_com_sucesso(): void
    {
        Produto::factory()->count(3)->create();

        $response = $this->getJson('/api/produtos');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => [
                        'id',
                        'nome',
                        'descricao',
                        'preco',
                        'preco_formatado',
                        'quantidade_estoque',
                        'em_estoque',
                        'categoria',
                        'ativo',
                        'criado_em',
                    ],
                ],
            ]);
    }

    public function test_pode_criar_um_novo_produto(): void
    {
        $dados = [
            'nome' => 'Fone de Ouvido Bluetooth',
            'descricao' => 'Fone com cancelamento de ruído ativo',
            'preco' => 399.90,
            'quantidade_estoque' => 15,
            'categoria' => 'Acessórios',
            'ativo' => true,
        ];

        $response = $this->postJson('/api/produtos', $dados);

        $response->assertStatus(201)
            ->assertJsonFragment([
                'nome' => 'Fone de Ouvido Bluetooth',
                'preco' => 399.90,
                'message' => 'Produto criado com sucesso.',
            ]);

        $this->assertDatabaseHas('produtos', [
            'nome' => 'Fone de Ouvido Bluetooth',
        ]);
    }

    public function test_valida_campos_obrigatorios_ao_criar_produto(): void
    {
        $response = $this->postJson('/api/produtos', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['nome', 'preco', 'quantidade_estoque', 'categoria']);
    }

    public function test_pode_visualizar_detalhes_de_um_produto(): void
    {
        $produto = Produto::factory()->create([
            'nome' => 'Monitor Gamer',
            'preco' => 1200.00,
        ]);

        $response = $this->getJson("/api/produtos/{$produto->id}");

        $response->assertStatus(200)
            ->assertJsonFragment([
                'id' => $produto->id,
                'nome' => 'Monitor Gamer',
                'preco' => 1200.00,
                'preco_formatado' => 'R$ 1.200,00',
            ]);
    }

    public function test_retorna_404_para_produto_inexistente(): void
    {
        $response = $this->getJson('/api/produtos/99999');

        $response->assertStatus(404);
    }

    public function test_pode_atualizar_um_produto(): void
    {
        $produto = Produto::factory()->create([
            'nome' => 'Teclado Antigo',
            'preco' => 100.00,
        ]);

        $dadosAtualizados = [
            'nome' => 'Teclado Mecânico RGB',
            'preco' => 250.00,
        ];

        $response = $this->putJson("/api/produtos/{$produto->id}", $dadosAtualizados);

        $response->assertStatus(200)
            ->assertJsonFragment([
                'nome' => 'Teclado Mecânico RGB',
                'preco' => 250.00,
                'message' => 'Produto atualizado com sucesso.',
            ]);

        $this->assertDatabaseHas('produtos', [
            'id' => $produto->id,
            'nome' => 'Teclado Mecânico RGB',
        ]);
    }

    public function test_pode_excluir_um_produto(): void
    {
        $produto = Produto::factory()->create();

        $response = $this->deleteJson("/api/produtos/{$produto->id}");

        $response->assertStatus(200)
            ->assertJsonFragment([
                'message' => 'Produto removido com sucesso.',
                'id' => $produto->id,
            ]);

        $this->assertDatabaseMissing('produtos', [
            'id' => $produto->id,
        ]);
    }

    public function test_pode_filtrar_produtos_por_termo_de_busca(): void
    {
        Produto::factory()->create(['nome' => 'Notebook Dell']);
        Produto::factory()->create(['nome' => 'Mouse Logitech']);

        $response = $this->getJson('/api/produtos?search=Notebook');

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data')
            ->assertJsonFragment(['nome' => 'Notebook Dell']);
    }
}
