return {
	{
		"neovim/nvim-lspconfig",
		dependencies = "nvim-cmp",
		config = function()
			local lsp_config = require("lspconfig")
			local configs = require("lspconfig.configs")
			local on_attach = function(client, buffer_nr)
				vim.keymap.set("n", "<cr>", vim.lsp.buf.definition, { buffer = buffer_nr })
				vim.keymap.set("n", "K", vim.lsp.buf.hover, { buffer = buffer_nr })
				
				-- Format on save using LSP
				if client.supports_method("textDocument/formatting") then
					vim.api.nvim_create_autocmd("BufWritePre", {
						buffer = buffer_nr,
						callback = function()
							vim.lsp.buf.format({ async = false })
						end,
					})
				end
			end


			lsp_config.elixirls.setup({
				cmd = { vim.loop.os_homedir() .. "/.config/nvim/elixir-ls-wrapper.sh" },
				on_attach = on_attach,
				capabilities = require("cmp_nvim_lsp").default_capabilities(),
				settings = {
					elixirLS = {
						dialyzerEnabled = false,
						fetchDeps = false,
					},
				},
			})

			lsp_config.tailwindcss.setup({
				on_attach = on_attach,
				capabilities = require("cmp_nvim_lsp").default_capabilities(),
			})

			lsp_config.ts_ls.setup({
				on_attach = on_attach,
				capabilities = require("cmp_nvim_lsp").default_capabilities(),
				root_dir = lsp_config.util.root_pattern("package.json", "tsconfig.json", "jsconfig.json", ".git"),
				cmd_env = {
					TMPDIR = vim.fn.expand("$HOME") .. "/tmp",
				},
			})

			lsp_config.biome.setup({
				on_attach = on_attach,
				capabilities = require("cmp_nvim_lsp").default_capabilities(),
				root_dir = function(fname)
					local root = lsp_config.util.root_pattern("biome.json", ".git")(fname)
					-- Don't start biome LSP in omnus repo
					if root and string.find(root, "omnus") then
						return nil
					end
					return root
				end,
			})
		end,
	},
}
