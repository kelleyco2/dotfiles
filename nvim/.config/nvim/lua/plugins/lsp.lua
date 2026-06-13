return {
	{
		"neovim/nvim-lspconfig",
		dependencies = "nvim-cmp",
		config = function()
			-- Keymaps + format-on-save for any attached server (Nvim 0.11+ LspAttach).
			vim.api.nvim_create_autocmd("LspAttach", {
				callback = function(args)
					local bufnr = args.buf
					local client = vim.lsp.get_client_by_id(args.data.client_id)
					vim.keymap.set("n", "<cr>", vim.lsp.buf.definition, { buffer = bufnr })
					vim.keymap.set("n", "K", vim.lsp.buf.hover, { buffer = bufnr })

					if client and client:supports_method("textDocument/formatting") then
						vim.api.nvim_create_autocmd("BufWritePre", {
							buffer = bufnr,
							callback = function()
								vim.lsp.buf.format({ async = false })
							end,
						})
					end
				end,
			})

			-- Capabilities for every server (nvim-cmp).
			vim.lsp.config("*", {
				capabilities = require("cmp_nvim_lsp").default_capabilities(),
			})

			vim.lsp.config("elixirls", {
				cmd = { vim.fn.expand("$HOME") .. "/.config/nvim/elixir-ls-wrapper.sh" },
				settings = {
					elixirLS = {
						dialyzerEnabled = false,
						fetchDeps = false,
					},
				},
			})

			-- vtsls: faster/leaner TS server than ts_ls. Install: npm i -g @vtsls/language-server
			vim.lsp.config("vtsls", {
				root_markers = { "package.json", "tsconfig.json", "jsconfig.json", ".git" },
				cmd_env = {
					TMPDIR = vim.fn.expand("$HOME") .. "/tmp",
				},
			})

			-- tailwindcss and biome use their default configs (+ global capabilities).
			local servers = { "elixirls", "tailwindcss", "vtsls", "biome" }

			-- Apex (install JAR via ~/.local/bin/install-apex-lsp)
			local apex_jar = vim.fn.expand("$HOME/.local/share/apex-lsp/apex-jorje-lsp.jar")
			if vim.fn.filereadable(apex_jar) == 1 then
				vim.lsp.config("apex_ls", {
					apex_jar_path = apex_jar,
					apex_enable_semantic_errors = false,
					apex_enable_completion_statistics = false,
					filetypes = { "apex" },
					root_markers = { "sfdx-project.json", ".git" },
				})
				table.insert(servers, "apex_ls")
			end

			-- Lightning Web Components (npm i -g @salesforce/lwc-language-server)
			if vim.fn.executable("lwc-language-server") == 1 then
				vim.lsp.config("lwc_ls", {
					root_markers = { "sfdx-project.json" },
				})
				table.insert(servers, "lwc_ls")
			end

			vim.lsp.enable(servers)
		end,
	},
}
