<?php

namespace Database\Factories;

use App\Models\Produto;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Produto>
 */
class ProdutoFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'nome' => fake()->words(3, true),
            'descricao' => fake()->sentence(10),
            'preco' => fake()->randomFloat(2, 10, 5000),
            'quantidade_estoque' => fake()->numberBetween(0, 100),
            'categoria' => fake()->randomElement(['Informática', 'Eletrônicos', 'Periféricos', 'Acessórios', 'Games']),
            'ativo' => true,
        ];
    }
}
