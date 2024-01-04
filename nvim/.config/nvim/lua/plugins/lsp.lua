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
			end

			if not configs.lexical then
				configs.lexical = {
					default_config = {
						filetypes = { "elixir", "eelixir", "heex" },
						cmd = {
							vim.loop.os_homedir() .. "/Code/lexical/_build/dev/package/lexical/bin/start_lexical.sh",
						},
						root_dir = function(fname)
							return lsp_config.util.root_pattern("mix.exs", ".git")(fname) or vim.loop.os_homedir()
						end,
					},
				}
			end

			lsp_config.lexical.setup({
				on_attach = on_attach,
				capabilities = require("cmp_nvim_lsp").default_capabilities(),
			})

			-- lsp_config.elixirls.setup({
			-- 	cmd = { "/opt/homebrew/bin/elixir-ls" },
			-- 	on_attach = on_attach,
			-- 	capabilities = require("cmp_nvim_lsp").default_capabilities(),
			-- })

			lsp_config.tailwindcss.setup({
				on_attach = on_attach,
				capabilities = require("cmp_nvim_lsp").default_capabilities(),
			})

			lsp_config.tsserver.setup({ on_attach = on_attach })
		end,
	},
}
