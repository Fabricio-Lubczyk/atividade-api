<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreProdutoRequest;
use App\Http\Requests\UpdateProdutoRequest;
use App\Http\Resources\ProdutoResource;
use App\Models\Produto;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ProdutoController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Produto::query();

        // Filtro por termo de busca (nome ou descrição)
        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('nome', 'like', "%{$search}%")
                  ->orWhere('descricao', 'like', "%{$search}%");
            });
        }

        // Filtro por categoria
        if ($categoria = $request->input('categoria')) {
            $query->where('categoria', $categoria);
        }

        // Filtro por disponibilidade em estoque
        if ($request->has('em_estoque')) {
            $emEstoque = filter_var($request->input('em_estoque'), FILTER_VALIDATE_BOOLEAN);
            if ($emEstoque) {
                $query->where('quantidade_estoque', '>', 0);
            } else {
                $query->where('quantidade_estoque', '<=', 0);
            }
        }

        $produtos = $query->orderBy('id', 'desc')->get();

        return ProdutoResource::collection($produtos);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreProdutoRequest $request): JsonResponse
    {
        $produto = Produto::create($request->validated());

        return (new ProdutoResource($produto))
            ->additional(['message' => 'Produto criado com sucesso.'])
            ->response()
            ->setStatusCode(201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Produto $produto): ProdutoResource
    {
        return new ProdutoResource($produto);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateProdutoRequest $request, Produto $produto): JsonResponse
    {
        $produto->update($request->validated());

        return (new ProdutoResource($produto))
            ->additional(['message' => 'Produto atualizado com sucesso.'])
            ->response()
            ->setStatusCode(200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Produto $produto): JsonResponse
    {
        $produto->delete();

        return response()->json([
            'message' => 'Produto removido com sucesso.',
            'id' => $produto->id,
        ], 200);
    }
}
